<template>
  <div>
    <div class="mx-auto max-w-6xl mt-4">
      <prism-code-editor
        class="prism-theme-light"
        style="height: 24rem; max-height: 24rem"
        :editable="editable"
        @input="changeText"
      />
      <div class="mb-6">
        <label class="block text-gray-500 font-bold">
          <input v-model="editable" class="mr-2" type="checkbox" />
          <span class="text-sm">
            editable
          </span>
        </label>
      </div>
    </div>
    <p class="mx-auto max-w-6xl mt-8" style="white-space: pre-wrap;">{{ text }}</p>
  </div>
</template>

<script>
import PrismCodeEditor from '~/components/prism-code-editor.vue'

export default {
  components: {
    PrismCodeEditor,
  },
  data() {
    return {
      text: '',
      editable: true,
    }
  },
  methods: {
    changeText(newText) {
      this.text = newText
    },
  },
}
</script>
