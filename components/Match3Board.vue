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
      <span v-if="!tile.locked">
    {{
      tile.specialType === 'bomb' ? '💣' :
      tile.specialType === 'line-horizontal' ? '🚀' :
      tile.specialType === 'line-vertical' ? '⚡' :
      tile.icon
    }}
</span>
    </div>

    <div
      v-for="particle in particles"
      :key="particle.id"
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

const tileSize = 4
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
  specialType?: 'line-horizontal'| 'line-vertical' | 'bomb'
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
          col >= 2 && board.find(t => t.row === row && t.col === col - 1)?.icon === icon && board.find(t => t.row === row && t.col === col - 2)?.icon === icon ||
          row >= 2 && board.find(t => t.col === col && t.row === row - 1)?.icon === icon && board.find(t => t.col === col && t.row === row - 2)?.icon === icon
        )

        board.push({ id: tileIdCounter++, icon, color, row, col, locked })
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
      if (!tile || tile.locked) continue

      const right = getTile(row, col + 1)
      const down = getTile(row + 1, col)

      if (right && !right.locked) {
        swapTiles(tile, right)
        const match = checkCreatesMatch(tile) || checkCreatesMatch(right)
        swapTiles(tile, right)
        if (match) return true
      }

      if (down && !down.locked) {
        swapTiles(tile, down)
        const match = checkCreatesMatch(tile) || checkCreatesMatch(down)
        swapTiles(tile, down)
        if (match) return true
      }
    }
  }
  return false
}

function checkCreatesMatch(tile: TileType): boolean {
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

function getTile(row: number, col: number): TileType | undefined {
  return tiles.value.find(tile => tile.row === row && tile.col === col)
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
            if (a.specialType) {
              triggeredSpecials.clear()
              triggerSpecial(a)
              removeMarkedTiles()
              setTimeout(() => applyGravity(), 600)
              return
            }
            if (b.specialType) {
              triggeredSpecials.clear()
              triggerSpecial(b)
              removeMarkedTiles()
              setTimeout(() => applyGravity(), 600)
              return
            }
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

const triggeredSpecials = new Set<number>()

function triggerSpecial(tile: TileType) {
  if (triggeredSpecials.has(tile.id)) return
  triggeredSpecials.add(tile.id)

  const tryTrigger = (t: TileType | undefined) => {
    if (!t || t.locked) return
    if (t.specialType && !triggeredSpecials.has(t.id)) {
      triggerSpecial(t)
    } else {
      t.removing = true
    }
  }

  if (tile.specialType === 'line-horizontal') {
    for (let col = 0; col < props.cols; col++) {
      tryTrigger(getTile(tile.row, col))
    }
  } else if (tile.specialType === 'line-vertical') {
    for (let row = 0; row < props.rows; row++) {
      tryTrigger(getTile(row, tile.col))
    }
  } else if (tile.specialType === 'bomb') {
    for (let r = tile.row - 1; r <= tile.row + 1; r++) {
      for (let c = tile.col - 1; c <= tile.col + 1; c++) {
        tryTrigger(getTile(r, c))
      }
    }
  }
}

function checkAndClearMatches(): boolean {
  const matchedGroups: TileType[][] = []

  // Horizontal
  for (let row = 0; row < props.rows; row++) {
    let match: TileType[] = []
    for (let col = 0; col < props.cols; col++) {
      const current = getTile(row, col)
      if (!current || current.locked) {
        if (match.length >= 3) matchedGroups.push([...match])
        match = []
        continue
      }
      if (match.length === 0 || match[0].icon === current.icon) {
        match.push(current)
      } else {
        if (match.length >= 3) matchedGroups.push([...match])
        match = [current]
      }
    }
    if (match.length >= 3) matchedGroups.push([...match])
  }

  // Vertical
  for (let col = 0; col < props.cols; col++) {
    let match: TileType[] = []
    for (let row = 0; row < props.rows; row++) {
      const current = getTile(row, col)
      if (!current || current.locked) {
        if (match.length >= 3) matchedGroups.push([...match])
        match = []
        continue
      }
      if (match.length === 0 || match[0].icon === current.icon) {
        match.push(current)
      } else {
        if (match.length >= 3) matchedGroups.push([...match])
        match = [current]
      }
    }
    if (match.length >= 3) matchedGroups.push([...match])
  }

  if (matchedGroups.length === 0) return false

  const matchedIds = new Set<number>()

  for (const group of matchedGroups) {
    for (const tile of group) matchedIds.add(tile.id)
    if (group.length >= 4) {
      const specialTile = group[Math.floor(group.length / 2)]
      const isHorizontal = group.every(tile => tile.row === group[0].row)
      const isVertical = group.every(tile => tile.col === group[0].col)

      if (group.length >= 5 && isHorizontal && isVertical) {
        specialTile.specialType = 'bomb'
      } else if (isHorizontal) {
        specialTile.specialType = 'line-horizontal'
      } else if (isVertical) {
        specialTile.specialType = 'line-vertical'
      }
      specialTile.removing = false
      matchedIds.delete(specialTile.id)
    }
  }

  if (matchSound) {
    matchSound.currentTime = 0
    matchSound.play()
  }

  for (const tile of tiles.value) {
  if (matchedIds.has(tile.id)) {
    if (tile.specialType && !triggeredSpecials.has(tile.id)) {
      triggerSpecial(tile)
    } else {
      tile.removing = true
    }
    particles.value.push({ id: particleId++, x: tile.col * tileSize + tileSize / 2, y: tile.row * tileSize + tileSize / 2 })
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
    const columnTiles = tiles.value.filter(tile => tile.col === col).sort((a, b) => a.row - b.row)
    let targetRow = props.rows - 1
    for (let i = columnTiles.length - 1; i >= 0; i--) {
      const tile = columnTiles[i]
      if (tile.row !== targetRow) tile.row = targetRow
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
      id: tileIdCounter++, icon: base.icon, color: base.color, row: targetRow, col, appearing: true
    }
    tiles.value.push(newTile)
    requestAnimationFrame(() => {
      newTile.appearing = false
    })
    targetRow--
  }
}

function removeMarkedTiles() {
  if (matchSound) {
    matchSound.currentTime = 0
    matchSound.play()
  }

  // Odpal efekty specjalnych kafelków przed usunięciem
  const specials = tiles.value.filter(t => t.removing && t.specialType)
  for (const tile of specials) {
    triggerSpecial(tile)
  }

  setTimeout(() => {
    tiles.value = tiles.value.filter(tile => !tile.removing)
    particles.value = []
  }, 600)
}

const boardStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  width: `${props.cols * tileSize}rem`,
  height: `${props.rows * tileSize}rem`,
  margin: '0 auto',
}))

function getTileStyle(tile: TileType): CSSProperties {
  const top = tile.appearing ? -tileSize : tile.row * tileSize
  return {
    position: 'absolute',
    width: `${tileSize}rem`,
    height: `${tileSize}rem`,
    top: `${top}rem`,
    left: `${tile.col * tileSize}rem`,
    backgroundColor: tile.color,
    transition: 'top 0.3s ease, left 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    borderRadius: '0.5rem',
    cursor: tile.locked ? 'default' : 'pointer',
    opacity: tile.locked ? 0.2 : 1,
    fontWeight: tile.specialType ? 'bold' : 'normal',
  }
}
</script>

<style scoped>
.board {
  border: 0.125rem solid #888;
  background-color: #f9f9f9;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;
  overflow: hidden;
}
.tile {
  user-select: none;
  transition: opacity 0.3s ease, transform 0.3s linear;
}
.selected {
  outline: 0.125rem solid #00f;
  z-index: 5;
}
.tile.removing {
  opacity: 0;
  transform: scale(0.7);
  pointer-events: none;
}

@keyframes pop {
  0% { transform: scale(1) translate(0, 0); opacity: 1; }
  100% { transform: scale(0.2) translate(0, -1.25rem); opacity: 0; }
}
</style>
