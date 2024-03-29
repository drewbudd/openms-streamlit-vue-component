<template>
  <div :id="id" style="width: 100%"></div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import Plotly from 'plotly.js-dist-min'
import type { Theme } from 'streamlit-component-lib'
import { useStreamlitDataStore } from '@/stores/streamlit-data'
import type { PlotlyLineArguments } from './plotly-lineplot'
import { useSelectionStore } from '@/stores/selection'

export default defineComponent({
  name: 'PlotlyLineplot',
  props: {
    args: {
      type: Object as PropType<PlotlyLineArguments>,
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
  computed: {
    id(): string {
      return `graph-${this.index}`
    },
    theme(): Theme | undefined {
      return this.streamlitDataStore.theme
    },
    selectedRow(): number | undefined {
      return this.selectionStore.selectedScanIndex
    },
    xAxisLabel(): string {
      switch (this.args.title) {
        case 'Annotated Spectrum':
          return 'm/z'
        case 'Deconvolved Spectrum':
          return 'Monoisotopic Mass'
        default:
          return ''
      }
    },
    xColumn(): string {
      switch (this.args.title) {
        case 'Annotated Spectrum':
          return 'MonoMass_Anno'
        case 'Deconvolved Spectrum':
          return 'MonoMass'
        default:
          return ''
      }
    },
    xValues(): number[] {
      const xValues: number[] = []
      if (this.selectedRow === undefined) {
        return xValues
      }
      ;(
        this.streamlitDataStore.allDataForDrawing.per_scan_data[this.selectedRow][
          this.xColumn
        ] as number[]
      ).forEach((num) => {
        xValues.push(num, num, num)
      })

      return xValues
    },
    yColmun(): string {
      switch (this.args.title) {
        case 'Annotated Spectrum':
          return 'SumIntensity_Anno'
        case 'Deconvolved Spectrum':
          return 'SumIntensity'
        default:
          return ''
      }
    },
    yValues(): number[] {
      const yValues: number[] = []
      if (this.selectedRow === undefined) {
        return yValues
      }
      ;(
        this.streamlitDataStore.allDataForDrawing.per_scan_data[this.selectedRow][
          this.yColmun
        ] as number[]
      ).forEach((num) => {
        yValues.push(-10000000, num, -10000000)
      })

      return yValues
    },
    data(): Plotly.Data[] {
      return [
        {
          x: this.xValues,
          y: this.yValues,
          mode: 'lines',
          type: 'scatter',
          connectgaps: false,
        },
      ]
    },
    layout(): Partial<Plotly.Layout> {
      return {
        title: `<b>${this.args.title}</b>`,
        showlegend: false,
        height: 400,
        xaxis: {
          title: this.xAxisLabel,
          showgrid: false,
        },
        yaxis: {
          title: 'Intensity',
          showgrid: true,
          gridcolor: this.theme?.secondaryBackgroundColor,
          rangemode: 'nonnegative',
          fixedrange: true,
        },
        paper_bgcolor: this.theme?.backgroundColor,
        plot_bgcolor: this.theme?.backgroundColor,
        font: {
          color: this.theme?.textColor,
          family: this.theme?.font,
        },
      }
    },
  },
  watch: {
    selectedRow() {
      this.graph()
    },
  },
  mounted() {
    this.graph()
  },
  methods: {
    async graph() {
      await Plotly.newPlot(this.id, this.data, this.layout, {
        modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
        modeBarButtonsToAdd: [
          {
            title: 'Download as SVG',
            name: 'toImageSvg',
            icon: Plotly.Icons.camera,
            click: (plotlyElement) => {
              Plotly.downloadImage(plotlyElement, {
                filename: 'FLASHViewer-lineplot',
                height: 400,
                width: 1200,
                format: 'svg',
              })
            },
          },
        ],
      })
    },
  },
})
</script>
