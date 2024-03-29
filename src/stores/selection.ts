import { defineStore } from 'pinia'

export const useSelectionStore = defineStore('selection', {
  state: () => ({
    scanIndex: undefined as number | undefined,
    massIndex: undefined as number | undefined,
    selectedObservedMass: undefined as number | undefined,
  }),
  getters: {
    selectedScanIndex: (state): number | undefined => state.scanIndex,
    selectedMassIndex: (state): number | undefined => state.massIndex,
    selectedObservedMassFromFragmentTable: (state): number | undefined =>
      state.selectedObservedMass,
  },
  actions: {
    updateSelectedScan(rowIndex: number) {
      this.scanIndex = rowIndex
    },
    updateSelectedMass(rowIndex?: number) {
      this.massIndex = rowIndex
    },
    selectedAminoAcid(fragmentMass?: number) {
      this.selectedObservedMass = fragmentMass
    },
  },
})
