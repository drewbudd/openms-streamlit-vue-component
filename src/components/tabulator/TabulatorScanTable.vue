<template>
  <TabulatorTable :table-data="tableData" :column-definitions="columnDefinitions" :title="args.title" :index="index"
    @row-selected="updateSelectedRow" />
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { ColumnDefinition } from 'tabulator-tables'
import { useStreamlitDataStore } from '@/stores/streamlit-data'
import type { TabulatorTableArguments } from './tabulator-table'
import { useSelectionStore } from '@/stores/selection'
import TabulatorTable from './TabulatorTable.vue'

export default defineComponent({
  name: 'TabulatorScanTable',
  components: {
    TabulatorTable
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
  data() {
    return {
      columnDefinitions: [
        {title: 'Index', field: 'id'},
        {title: 'Scan Number', field: 'Scan'},
        {title: 'MS Level', field: 'MSLevel'},
        {title: 'Retention time', field: 'RT'},
        {title: 'Precursor Mass', field: 'PrecursorMass'},
        {title: '#Masses', field: '#Masses'}
      ] as ColumnDefinition[]
    }
  },
  setup() {
    const streamlitDataStore = useStreamlitDataStore()
    const selectionStore = useSelectionStore()
    return { streamlitDataStore, selectionStore }
  },
  computed: {
    tableData(): Record<string, unknown>[] {
      const rows = this.streamlitDataStore.allDataframes.per_scan_data;
      rows.forEach(row => row['id'] = row['index'])
      return rows
    },
  },
  methods: {
    updateSelectedRow(selectedRow?: number) {
      if (selectedRow) {
        this.selectionStore.updateSelectedRow(selectedRow)
      }
    },
  },
})
</script>