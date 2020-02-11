<template>
  <div class="emoji-container">
    <div class="emoji-container-bar">
      <anchors
        :data="mutableData"
        :color="color"
        :i18n="mutableI18n"
        :categories="filteredCategories"
        :active-category="activeCategory"
        @click="onAnchorClick"
      />
    </div>

    <div class="emoji-container-scroll" ref="scroll" @scroll="onScroll">
      <category
        v-for="category in filteredCategories"
        :key="category.id"
        v-show="infiniteScroll || category == activeCategory"
        ref="categories"
        :data="mutableData"
        :i18n="mutableI18n"
        :id="category.id"
        :name="category.name"
        :emojis="category.emojis"
        :emoji-props="emojiProps"
      />
    </div>
  </div>
</template>

<script>
import Anchors from './Anchors.vue'
import Category from './Category'

import data from './data/all.json'
import { uncompress } from './utils/data'
import { deepMerge } from './utils'
import { PickerProps } from './utils/shared-props'

const I18N = {
  search: 'Search',
  notfound: 'No Emoji Found',
  categories: {
    search: 'Search Results',
    people: 'Smileys & People',
    nature: 'Animals & Nature',
    foods: 'Food & Drink',
    activity: 'Activity',
    places: 'Travel & Places',
    objects: 'Objects',
    symbols: 'Symbols',
    flags: 'Flags',
    custom: 'Custom',
  },
}

export default {
  name: 'EmojiPicker',
  components: {
    Anchors,
    Category
  },
  created() {
    let categories = this.mutableData.categories.map(c => {
      let { id, name, emojis } = c
      if (this.emojisToShowFilter) {
        emojis = c.emojis.filter(e => this.emojisToShowFilter(this.data.emojis[e] || e))
      }
      return { id, name, emojis }
    })

    this.categories.push(...categories)
    this.categories[0].first = true
    this.activeCategory = this.filteredCategories[0]
  },
  data() {
    return {
      mutableData: data.compressed ? uncompress(data) : data,
      categories: [],
      mutableI18n: deepMerge(I18N, this.i18n),
      activeCategory: null
    }
  },
  props: {
    ...PickerProps
  },
  computed: {
    filteredCategories() {
      return this.categories.filter((category) => {
        let isIncluded = this.include && this.include.length ? this.include.indexOf(category.id) > -1 : true
        let isExcluded = this.exclude && this.exclude.length ? this.exclude.indexOf(category.id) > -1 : false
        let hasEmojis = category.emojis.length > 0
        if (this.emojisToShowFilter) {
          hasEmojis = category.emojis.some((emoji) => {
            return this.emojisToShowFilter(this.mutableData.emojis[emoji] || emoji)
          })
        }
        return isIncluded && !isExcluded && hasEmojis
      })
    },
    emojiProps() {
      return {
        native: this.native,
        skin: this.activeSkin,
        size: this.emojiSize,
        set: this.set,
        sheetSize: this.sheetSize,
        forceSize: this.native,
        tooltip: this.emojiTooltip,
        backgroundImageFn: this.backgroundImageFn,
        onEnter: this.onEmojiEnter.bind(this),
        onLeave: this.onEmojiLeave.bind(this),
        onClick: this.onEmojiClick.bind(this)
      }
    },
  },
  methods: {
    onScroll() {
      if (this.infiniteScroll && !this.waitingForPaint) {
        this.waitingForPaint = true
        window.requestAnimationFrame(this.onScrollPaint.bind(this))
      }
    },
    onScrollPaint() {
      this.waitingForPaint = false
      let scrollTop = this.$refs.scroll.scrollTop,
          activeCategory = this.filteredCategories[0]
      for (let i = 0, l = this.filteredCategories.length; i < l; i++) {
        let category = this.filteredCategories[i],
            component = this.$refs.categories[i]
        if (component && component.$el.offsetTop > scrollTop) {
          break
        }
        activeCategory = category
      }
      this.activeCategory = activeCategory
    },
    onAnchorClick(category) {
      let i = this.filteredCategories.indexOf(category),
          component = this.$refs.categories[i],
          scrollToComponent = () => {
            if (component) {
              let top = component.$el.offsetTop
              if (category.first) {
                top = 0
              }
              this.$refs.scroll.scrollTop = top
            }
          }
      if (this.infiniteScroll) {
        scrollToComponent()
      } else {
        this.activeCategory = this.filteredCategories[i];
      }
    },
    onEmojiEnter(emoji) {
      if (emoji.custom) {
        // Use Array.prototype.find() when it is more widely supported.
        const customEmoji = this.customEmojis.filter(_emoji => _emoji.id === emoji.id)[0]
        emoji = Object.assign({}, emoji, customEmoji)
      }
      this.previewEmoji = emoji
    },
    onEmojiLeave(emoji) {
      this.previewEmoji = null
    },
    onEmojiClick(emoji) {
      this.$emit('select', emoji)
    }
  }
}
</script>

<style>
.emoji-container,
.emoji-container * {
  box-sizing: border-box;
  line-height: 1.15;
}
.emoji-container .emoji-mart-emoji {
  padding: 6px;
  cursor: pointer;
}
</style>

<style scoped>
.emoji-container {
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  height: 420px;
  color: #222427;
  border: 1px solid #d9d9d9;
  border-radius: 5px;
  background: #fff;
}

.emoji-container-bar {
  border: 0 solid #d9d9d9;
}
.emoji-container-bar:first-child {
  border-bottom-width: 1px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
.emoji-container-bar:last-child {
  border-top-width: 1px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}
.emoji-container-scroll {
  position: relative;
  overflow-y: scroll;
  flex: 1;
  padding: 0 6px 6px 6px;
  z-index: 0; /* Fix for rendering sticky positioned category labels on Chrome */
  will-change: transform; /* avoids "repaints on scroll" in mobile Chrome */
  -webkit-overflow-scrolling: touch;
}
</style>