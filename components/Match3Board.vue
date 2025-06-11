<template>
  <div class="board" :style="boardStyle">
    <div
      v-for="tile in tiles"
      :key="tile.id"
      class="tile"
      :class="{
        selected: selected?.id === tile.id,
        removing: tile.removing
      }"
      :style="getTileStyle(tile)"
      @click="handleClick(tile)"
    >
      <span v-if="!tile.locked">{{ tile.icon }}</span>
    </div>

    <div
      v-for="particle in particles"
      :key="particle.id"
      class="particle"
      :style="{
        top: `${particle.y}px`,
        left: `${particle.x}px`
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { CSSProperties } from 'vue'

const props = defineProps<{
  rows: number
  cols: number
  types: { icon: string; color: string }[]
  lockedTiles?: number[]
}>()

const emit = defineEmits<{
  (e: 'update:score' | 'update:moves', value: number): void
}>()

const tileSize = 64
const lockedIndices = computed(() => props.lockedTiles ?? [])
let tileIdCounter = 0

interface TileType {
  id: number
  icon: string
  color: string
  row: number
  col: number
  locked?: boolean
  appearing?: boolean
  removing?: boolean
}

const tiles = ref<TileType[]>([])
const selected = ref<TileType | null>(null)
const score = ref(0)
const moves = ref(0)
const particles = ref<{ id: number; x: number; y: number }[]>([])
let particleId = 0
let matchSound: HTMLAudioElement | null = null

onMounted(() => {
  tiles.value = generateInitialBoard()
  if (typeof window !== 'undefined') {
    matchSound = new Audio('/sounds/match.wav')
  }
})

function generateInitialBoard(): TileType[] {
  let attempt = 0
  let board: TileType[] = []

  do {
    board = []
    for (let row = 0; row < props.rows; row++) {
      for (let col = 0; col < props.cols; col++) {
        const index = row * props.cols + col
        const locked = lockedIndices.value.includes(index)

        let icon: string
        let color: string
        do {
          const base = props.types[Math.floor(Math.random() * props.types.length)]
          icon = base.icon
          color = base.color
        } while (
          col >= 2 &&
          board.find(t => t.row === row && t.col === col - 1)?.icon === icon &&
          board.find(t => t.row === row && t.col === col - 2)?.icon === icon ||
          row >= 2 &&
          board.find(t => t.col === col && t.row === row - 1)?.icon === icon &&
          board.find(t => t.col === col && t.row === row - 2)?.icon === icon
        )

        board.push({
          id: tileIdCounter++,
          icon,
          color,
          row,
          col,
          locked,
        })
      }
    }

    tiles.value = board
    attempt++
    if (attempt > 20) break
  } while (!hasAnyValidMove())

  return board
}

function hasAnyValidMove(): boolean {
  for (let row = 0; row < props.rows; row++) {
    for (let col = 0; col < props.cols; col++) {
      const tile = getTile(row, col)
      if (!tile) continue

      const right = getTile(row, col + 1)
      const down = getTile(row + 1, col)

      if (right) {
        swapTiles(tile, right)
        if (createsMatch(tile) || createsMatch(right)) {
          swapTiles(tile, right)
          return true
        }
        swapTiles(tile, right)
      }

      if (down) {
        swapTiles(tile, down)
        if (createsMatch(tile) || createsMatch(down)) {
          swapTiles(tile, down)
          return true
        }
        swapTiles(tile, down)
      }
    }
  }
  return false
}

function createsMatch(tile: TileType): boolean {
  const sameIcon = (r: number, c: number) => getTile(r, c)?.icon === tile.icon
  const r = tile.row
  const c = tile.col

  return (
    (sameIcon(r, c - 1) && sameIcon(r, c - 2)) ||
    (sameIcon(r, c + 1) && sameIcon(r, c + 2)) ||
    (sameIcon(r, c - 1) && sameIcon(r, c + 1)) ||
    (sameIcon(r - 1, c) && sameIcon(r - 2, c)) ||
    (sameIcon(r + 1, c) && sameIcon(r + 2, c)) ||
    (sameIcon(r - 1, c) && sameIcon(r + 1, c))
  )
}

function handleClick(tile: TileType) {
  if (tile.locked) return
  if (!selected.value) {
    selected.value = tile
  } else if (selected.value.id === tile.id) {
    selected.value = null
  } else {
    const a = selected.value
    const b = tile
    if (areAdjacent(a, b)) {
      swapTiles(a, b)
      moves.value++
      emit('update:moves', moves.value)

      setTimeout(() => {
        selected.value = null
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const matched = checkAndClearMatches()
            if (matched) {
              setTimeout(() => applyGravity(), 600)
            } else {
              swapTiles(a, b)
            }
          })
        })
      }, 300)
    } else {
      selected.value = b
    }
  }
}

function areAdjacent(a: TileType, b: TileType): boolean {
  const dx = Math.abs(a.col - b.col)
  const dy = Math.abs(a.row - b.row)
  return dx + dy === 1
}

function swapTiles(a: TileType, b: TileType) {
  const tempRow = a.row
  const tempCol = a.col
  a.row = b.row
  a.col = b.col
  b.row = tempRow
  b.col = tempCol
}

function checkAndClearMatches(): boolean {
  if (tiles.value.some(t => t.removing)) return false

  const matchedIds = new Set<number>()

  for (let row = 0; row < props.rows; row++) {
    for (let col = 0; col < props.cols - 2; col++) {
      const t1 = getTile(row, col)
      const t2 = getTile(row, col + 1)
      const t3 = getTile(row, col + 2)
      if (t1 && t2 && t3 && t1.icon === t2.icon && t1.icon === t3.icon) {
        matchedIds.add(t1.id)
        matchedIds.add(t2.id)
        matchedIds.add(t3.id)
      }
    }
  }

  for (let col = 0; col < props.cols; col++) {
    for (let row = 0; row < props.rows - 2; row++) {
      const t1 = getTile(row, col)
      const t2 = getTile(row + 1, col)
      const t3 = getTile(row + 2, col)
      if (t1 && t2 && t3 && t1.icon === t2.icon && t1.icon === t3.icon) {
        matchedIds.add(t1.id)
        matchedIds.add(t2.id)
        matchedIds.add(t3.id)
      }
    }
  }

  if (matchedIds.size === 0) return false

  if (matchSound) {
    matchSound.currentTime = 0
    matchSound.play()
  }

  for (const tile of tiles.value) {
    if (matchedIds.has(tile.id)) {
      tile.removing = true
      particles.value.push({
        id: particleId++,
        x: tile.col * tileSize + tileSize / 2,
        y: tile.row * tileSize + tileSize / 2,
      })
    }
  }

  setTimeout(() => {
    tiles.value = tiles.value.filter(tile => !tile.removing)
    particles.value = []
  }, 600)

  score.value += matchedIds.size * 10
  emit('update:score', score.value)
  return true
}

function applyGravity() {
  for (let col = 0; col < props.cols; col++) {
    const columnTiles = tiles.value
      .filter(tile => tile.col === col)
      .sort((a, b) => a.row - b.row)

    let targetRow = props.rows - 1
    for (let i = columnTiles.length - 1; i >= 0; i--) {
      const tile = columnTiles[i]
      if (tile.row !== targetRow) {
        tile.row = targetRow
      }
      targetRow--
    }

    spawnNewTiles(col, targetRow)
  }

  setTimeout(() => {
    if (checkAndClearMatches()) {
      setTimeout(() => applyGravity(), 600)
    } else {
      setTimeout(() => {
        tiles.value = [...tiles.value]
      }, 300)
    }
  }, 250)

  if (!hasAnyValidMove()) {
    tiles.value = generateInitialBoard()
  }
}

function spawnNewTiles(col: number, fromRow: number) {
  let targetRow = fromRow
  while (targetRow >= 0) {
    const base = props.types[Math.floor(Math.random() * props.types.length)]
    const newTile: TileType = {
      id: tileIdCounter++,
      icon: base.icon,
      color: base.color,
      row: targetRow,
      col,
      appearing: true,
    }
    tiles.value.push(newTile)

    requestAnimationFrame(() => {
      newTile.appearing = false
    })

    targetRow--
  }
}

function getTile(row: number, col: number): TileType | undefined {
  return tiles.value.find(tile => tile.row === row && tile.col === col)
}

const boardStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  width: `${props.cols * tileSize}px`,
  height: `${props.rows * tileSize}px`,
  margin: '0 auto',
}))

function getTileStyle(tile: TileType): CSSProperties {
  const top = tile.appearing ? -tileSize : tile.row * tileSize
  return {
    position: 'absolute',
    width: `${tileSize}px`,
    height: `${tileSize}px`,
    top: `${top}px`,
    left: `${tile.col * tileSize}px`,
    backgroundColor: tile.color,
    transition: 'top 0.3s ease, left 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    borderRadius: '8px',
    cursor: tile.locked ? 'default' : 'pointer',
    opacity: tile.locked ? 0.2 : 1,
  }
}
</script>

<style scoped>
.board {
  border: 2px solid #888;
  background-color: #f9f9f9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}
.tile {
  user-select: none;
  transition: opacity 0.3s ease, transform 0.3s linear;
}
.selected {
  outline: 2px solid #00f;
}
.tile.removing {
  opacity: 0;
  transform: scale(0.7);
  pointer-events: none;
}
.particle {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: white;
  opacity: 0.9;
  pointer-events: none;
  animation: pop 0.6s ease-out forwards;
}
@keyframes pop {
  0% {
    transform: scale(1) translate(0, 0);
    opacity: 1;
  }
  100% {
    transform: scale(0.2) translate(0, -20px);
    opacity: 0;
  }
}
</style>
