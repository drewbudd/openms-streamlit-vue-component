<template>
  <v-btn id="download-button" variant="text" size="large" icon="mdi-download" @click="triggerDownloadSvg"></v-btn>
  <v-tooltip text="Save as SVG" location="bottom" activator="#download-button"></v-tooltip>
  <a ref="downloadLink" style="visibility: hidden;"></a>
  <v-dialog v-model="svgDownloadTriggered" :scrim="false" persistent width="auto">
    <v-card color="primary">
      <v-card-text>
        Please stand by
        <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { elementToSVG } from 'dom-to-svg'
import { useStreamlitDataStore } from '@/stores/streamlit-data'

export default defineComponent({
  name: 'SvgScreenshot',
  props: {
    elementId: {
      type: String,
      required: true
    }
  },
  setup() {
    const streamlitDataStore = useStreamlitDataStore()
    return { streamlitDataStore }
  },
  data() {
    return {
      svgDownloadTriggered: false as boolean
    }
  },
  computed: {
    elementToScreenshot(): HTMLElement | null {
      return document.getElementById(this.elementId)
    }
  },
  methods: {
    triggerDownloadSvg() {
      if (this.elementToScreenshot) {
        this.prepareSvg(this.elementToScreenshot)
      }
    },
    async prepareSvg(htmlElement: HTMLElement) {
      this.svgDownloadTriggered = true

      const svgDocument = elementToSVG(htmlElement)

      const element = this.$refs.downloadLink as HTMLAnchorElement
      element.download = 'screenshot.svg'
      element.href = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svgDocument)], { type: 'image/svg+xml' }))
      element.click()

      this.svgDownloadTriggered = false
    }
  },
})
</script>
