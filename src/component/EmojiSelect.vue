<template>
  <div class="emoji-select__wrapper" ref="emojiWrapper">
    <popper trigger="click" :options="{placement: 'top'}" ref="popperChild">
      <input slot="reference" type="text" autocomplete="off" readonly="readonly" v-model="value.label" @click="onSelectClick" />
      <div class="popper">
        <div class="emoji-select__option" :class="{ 'selected': no === value.value }" @click="onNoClick">Нет</div>
        <emoji-picker @select="onEmojiSelect" :i18n="i18n" />
      </div>
    </popper>
    <span class="emoji-select__suffix">
      <span class="emoji-select__suffix-inner" v-html="customSVGs.arrow" />
    </span>
  </div>
</template>

<script>
import customSVGs from './svgs/custom'
import EmojiPicker from './EmojiPicker'
import Popper from './Popper'

const NO = 'no'

const defaultValue = {
  label: 'Нет',
  value: 'no'
}

export default {
  name: 'emoji-select',
  props: {
    value: {
      type: Object,
      required: true
    },
    onEmojiSelect: {
      type: Function,
      required: true
    },
    i18n: {
      type: Object
    }
  },
  components: {
    EmojiPicker,
    Popper
  },
  created() {
    this.customSVGs = customSVGs
    document.addEventListener('click', e => {
      if (!this.$refs.emojiWrapper.contains(e.target)) {
        const svg = document.querySelector('.emoji-select__arrow')
        svg.classList.remove('is-reverse')
      }
    })
    if (!this.value.value) {
      this.$emit('input', defaultValue)
    }
  },
  data: function() {
    return {
      no: NO
    }
  },
  methods: {
    onSelectClick() {
      const svg = document.querySelector('.emoji-select__arrow')
      svg.classList.add('is-reverse')
    },
    onNoClick() {
      const svg = document.querySelector('.emoji-select__arrow')
      
      this.$emit('input', defaultValue)
      this.$refs.popperChild.doClose()
      svg.classList.remove('is-reverse')
    }
  },
  watch: {
    value(val) {
      const svg = document.querySelector('.emoji-select__arrow')
      
      this.$emit('input', val)
      this.$refs.popperChild.doClose()
      svg.classList.remove('is-reverse')
    }
  }
}
</script>

<style>
.emoji-select__wrapper {
  width: 100%;
  font-size: 14px;
  position: relative;
}

.emoji-select__wrapper input {
  width: 100%;
  height: 40px;
  padding: 0 15px;
  padding-right: 30px;
  cursor: pointer;
  box-sizing: border-box;
  outline: none;
  border: 1px solid #dcdfe6;
  font-size: inherit;
  color: #606266;
  border-radius: 4px;
  line-height: 40px;
  background-color: #fff;
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
}

.emoji-select__wrapper input::placeholder {
  color: #c0c4cc;
}

.emoji-select__wrapper input:hover {
  border-color: #c0c4cc;
}

.emoji-select__suffix {
  color: #c0c4cc;
  height: 100%;
  font-size: 16px;
  position: absolute;
  right: 6px;
  top: 0;
  pointer-events: none;
}

.emoji-select__suffix::after {
  content: '';
  height: 100%;
  width: 0;
  display: inline-block;
  vertical-align: middle;
}

.emoji-select__option {
  font-size: 14px;
  padding: 0 20px;
  white-space: nowrap;
  line-height: 34px;
  cursor: pointer;
}

.emoji-select__option.selected {
  background-color: #f5f7fa;
}

.emoji-select__option:hover {
  background-color: #f5f7fa;
}
</style>

<style>
.emoji-select__arrow {
  vertical-align: middle;
  transition: transform .3s;
}

.is-reverse {
  transform: rotate(-180deg);
}
</style>
