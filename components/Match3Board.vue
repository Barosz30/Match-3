<template>
  <div class="board" :style="boardStyle">
    <div
      v-for="tile in tiles"
      :key="tile.id"
      class="tile"
      :class="{ selected: selected?.id === tile.id }"
      :style="getTileStyle(tile)"
      @click="handleClick(tile)"
    >
      <span v-if="!tile.locked">{{ tile.icon }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import type { CSSProperties } from 'vue'

const props = defineProps<{
  rows: number
  cols: number
  types: { icon: string; color: string }[]
  lockedTiles?: number[]
}>()

const tileSize = 64 // in px
const lockedIndices = computed(() => props.lockedTiles ?? [])
let tileIdCounter = 0

interface TileType {
  id: number
  icon: string
  color: string
  row: number
  col: number
  locked?: boolean
}

const tiles = ref<TileType[]>([])
const selected = ref<TileType | null>(null)
const score = ref(0)
const moves = ref(0)

function generateInitialBoard(): TileType[] {
  const result: TileType[] = []
  for (let row = 0; row < props.rows; row++) {
    for (let col = 0; col < props.cols; col++) {
      const index = row * props.cols + col
      const locked = lockedIndices.value.includes(index)
      const base = props.types[Math.floor(Math.random() * props.types.length)]

      result.push({
        id: tileIdCounter++,
        icon: base.icon,
        color: base.color,
        row,
        col,
        locked,
      })
    }
  }
  return result
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
      if (!checkAndClearMatches()) {
        // undo
        setTimeout(() => swapTiles(a, b), 200)
      } else {
        setTimeout(() => applyGravity(), 250)
      }
      selected.value = null
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
  const matchedIds = new Set<number>()

  for (let row = 0; row < props.rows; row++) {
    for (let col = 0; col < props.cols - 2; col++) {
      const match = getTile(row, col), next1 = getTile(row, col + 1), next2 = getTile(row, col + 2)
      if (match && next1 && next2 && match.icon === next1.icon && match.icon === next2.icon) {
        matchedIds.add(match.id)
        matchedIds.add(next1.id)
        matchedIds.add(next2.id)
      }
    }
  }

  for (let col = 0; col < props.cols; col++) {
    for (let row = 0; row < props.rows - 2; row++) {
      const match = getTile(row, col), next1 = getTile(row + 1, col), next2 = getTile(row + 2, col)
      if (match && next1 && next2 && match.icon === next1.icon && match.icon === next2.icon) {
        matchedIds.add(match.id)
        matchedIds.add(next1.id)
        matchedIds.add(next2.id)
      }
    }
  }

  if (matchedIds.size === 0) return false

  tiles.value = tiles.value.filter(tile => !matchedIds.has(tile.id))
  score.value += matchedIds.size * 10
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

    while (targetRow >= 0) {
      const base = props.types[Math.floor(Math.random() * props.types.length)]
      tiles.value.push({
        id: tileIdCounter++,
        icon: base.icon,
        color: base.color,
        row: targetRow,
        col,
      })
      targetRow--
    }
  }

  setTimeout(() => {
    if (checkAndClearMatches()) {
      setTimeout(() => applyGravity(), 250)
    }
  }, 250)
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
  return {
    position: 'absolute',
    width: `${tileSize}px`,
    height: `${tileSize}px`,
    top: `${tile.row * tileSize}px`,
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

watchEffect(() => {
  tiles.value = generateInitialBoard()
})
</script>

<style scoped>
.board {
  border: 2px solid #888;
  background-color: #f9f9f9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}
.tile {
  user-select: none;
}
.selected {
  outline: 2px solid #00f;
}
</style>
