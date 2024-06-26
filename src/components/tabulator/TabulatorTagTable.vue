<template>
  <TabulatorTable
    :table-data="tableData"
    :column-definitions="columnDefinitions"
    title="Tag Table"
    :index="index"
    :selected-row-index-from-listening="selectedRow"
    @row-selected="updateSelectedTag"
    :default-row=1
  />
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useStreamlitDataStore } from '@/stores/streamlit-data'
import type { TabulatorTableArguments } from './tabulator-table'
import { useSelectionStore } from '@/stores/selection'
import TabulatorTable from './TabulatorTable.vue'
import type { ColumnDefinition } from 'tabulator-tables'
import { toFixedFormatter } from '@/components/tabulator/tabulator-formatters'
import { timingSafeEqual } from 'crypto'
import { start } from 'repl'

export default defineComponent({
  name: 'TabulatorTagTable',
  components: {
    TabulatorTable,
  },
  props: {
    args: {
      type: Object as PropType<TabulatorTableArguments>,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const streamlitDataStore = useStreamlitDataStore()
    const selectionStore = useSelectionStore()
    return { streamlitDataStore, selectionStore }
  },
  data() {
    return {
      columnDefinitions: [
        { title: 'Scan Number', field: 'Scan' },
        //{ title: 'Tag Index', field: 'TagIndex' },
        { title: 'Start Position', field: 'StartPos' },
        { title: 'End Position', field: 'EndPos' },
        { title: 'Sequence', field: 'TagSequence'},
        { title: 'Length', field: 'Length' },
        { title: 'Score', field: 'Score' },
        { title: 'N mass', field: 'Nmass'},
        { title: 'C mass', field: 'Cmass' },
        { title: 'Δ mass', field: 'DeltaMass' },
      ] as ColumnDefinition[],
      selectedTagIndex: undefined as number | undefined,
    }
  },
  computed: {
    selectedRow(): number | undefined {
      return this.selectionStore.selectedTagIndex
    },
    tableData(): Record<string, unknown>[] {
      const rows = this.streamlitDataStore.dataForDrawing.tag_table
      let filteredRows = rows.filter(row => row['ProteinIndex'] === this.selectionStore.selectedProteinIndex)
      const selectedAA = this.selectionStore.selectedAApos
      if (selectedAA !== undefined) {
        filteredRows = filteredRows.filter(row => {
          const startPos = row['StartPos'];
          const endPos = row['EndPos'];
          return (typeof startPos === 'number' && typeof endPos === 'number' && startPos <= selectedAA && endPos >= selectedAA);
        });
      }
      filteredRows.forEach(row => row['id'] = row['TagIndex'])
      return filteredRows
    }
  },
  watch: {
  },
  methods: {
    getRowByTagIndex(tagIndex : number) {
      const rows = this.tableData
      const row = rows.find(r => r['id'] === tagIndex)
      return row
    },

    updateSelectedTag(selectedRow?: number) {
      if (selectedRow === undefined) {
        return
      }
      this.selectionStore.updateSelectedTag(selectedRow)

      const row = this.getRowByTagIndex(selectedRow)
      if (row === undefined) {
        return
      }
      
      const scan = row['Scan']
      if (typeof scan === 'number') {
        this.selectionStore.updateSelectedScan(scan)
      }
      const mzs = row['mzs']
      let masses : number[] = []
      if (typeof mzs === 'string') {
        masses = mzs.split(',').map(Number).filter(number => number !== 0);
      }
      const startPos: number = typeof row['StartPos'] === 'number' ? row['StartPos'] : 0
      const endPos: number = typeof row['EndPos'] === 'number' ? row['EndPos'] : 0
      let tagPos : number = -1000

      if (
        (startPos !== undefined) && 
        (this.selectionStore.selectedAApos !== undefined) &&
        (typeof startPos === "number")
      ) {
        tagPos = this.selectionStore.selectedAApos - startPos
      }
      const sequence = row['TagSequence']
      let tagSequence : String = ""
      if (typeof sequence === "string") {
        tagSequence = sequence
      }

      let nTerminal : Boolean = false
      if (row["N mass"] === -1) {
          nTerminal = true
      }

      this.selectionStore.updateTagData(
        {
          sequence: tagSequence,
          nTerminal: nTerminal,
          masses: masses,
          selectedAA: tagPos,
          startPos: startPos,
          endPos: endPos
        }
      )
    },
  },
})
</script>
