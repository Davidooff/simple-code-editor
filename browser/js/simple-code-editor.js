// CopyCode
const CopyCode = {
  data() {
    return {
      message: "Copy code",
    };
  },
  methods: {
    showMessage() {
      this.message = "Copied!";
    },
    resetMessage() {
      this.message = "Copy code";
    },
  },
  template: `
  <div class="copy-code" @click="showMessage" @mouseout="resetMessage">
  <div class="tooltip">{{ message }}</div>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
</div>
`,
};

// Dropdown
const Dropdown = {
  props: {
    width: {
      type: String,
      default: "80px",
    },
    height: {
      type: String,
      default: "auto",
    },
    title: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    defaultDisplay: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      show: this.defaultDisplay,
    };
  },
  methods: {
    toggleDropdown() {
      if (!this.disabled) {
        this.show = this.show ? false : true;
      }
    },
    hideDropdown() {
      this.show = false;
    },
  },
  template: `
  <div class="dropdown" :class="{ disabled: disabled }" @click="toggleDropdown" @focusout="hideDropdown" tabindex="0">
    <div class="title">
      <div>{{ title }}</div>
      <svg
        v-if="!this.disabled"
        :style="{ transform: show ? 'rotateZ(180deg)' : 'rotateZ(0deg)' }"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
    <transition name="fade">
      <div class="list" :style="{ width: width, height: height }" v-if="show">
        <slot></slot>
      </div>
    </transition>
  </div>
`,
};

// CodeEditor
const CodeEditor = {
  components: {
    CopyCode: CopyCode,
    Dropdown: Dropdown,
  },
  props: {
    modelValue: {
      type: String,
    },
    value: {
      type: String,
    },
    theme: {
      type: String,
      default: "github-dark",
    },
    tabSpaces: {
      type: Number,
      default: 2,
    },
    wrap: {
      type: Boolean,
      default: false,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    hideHeader: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: "540px",
    },
    height: {
      type: String,
      default: "auto",
    },
    maxWidth: {
      type: String,
    },
    minWidth: {
      type: String,
    },
    maxHeight: {
      type: String,
    },
    minHeight: {
      type: String,
    },
    borderRadius: {
      type: String,
      default: "12px",
    },
    languages: {
      type: Array,
      default: function () {
        return [["javascript", "JS"]];
      },
    },
    langListWidth: {
      type: String,
      default: "110px",
    },
    langListHeight: {
      type: String,
      default: "auto",
    },
    langListDisplay: {
      type: Boolean,
      default: false,
    },
    displayLanguage: {
      type: Boolean,
      default: true,
    },
    copyCode: {
      type: Boolean,
      default: true,
    },
    zIndex: {
      type: String,
      default: "0",
    },
    fontSize: {
      type: String,
      default: "17px",
    },
    padding: {
      type: String,
      default: "20px",
    },
  },
  directives: {
    highlight: {
      mounted(el, binding) {
        el.textContent = binding.value;
        hljs.highlightElement(el);
      },
      updated(el, binding) {
        if (el.isScrolling) {
          el.isScrolling = false;
        } else {
          el.textContent = binding.value;
          hljs.highlightElement(el);
        }
      },
    },
  },
  data() {
    return {
      scrollBarWidth: 0,
      scrollBarHeight: 0,
      top: 0,
      left: 0,
      languageClass: "hljs language-" + this.languages[0][0],
      languageTitle: this.languages[0][1] ? this.languages[0][1] : this.languages[0][0],
      content: this.value,
      cursorPosition: 0,
      insertTab: false,
    };
  },
  computed: {
    tabWidth() {
      let result = "";
      for (let i = 0; i < this.tabSpaces; i++) {
        result += " ";
      }
      return result;
    },
    contentValue() {
      return this.modelValue == undefined ? this.content + "\n" : this.modelValue + "\n";
    },
    scroll() {
      return this.height == "auto" ? false : true;
    },
    withoutHeader() {
      return this.hideHeader ? true : !this.displayLanguage && !this.copyCode ? true : false;
    },
  },
  methods: {
    updateValue(e) {
      if (this.modelValue == undefined) {
        this.content = e.target.value;
      } else {
        this.$emit("update:modelValue", e.target.value);
      }
    },
    changeLang(lang) {
      this.languageTitle = lang[1] ? lang[1] : lang[0];
      this.languageClass = "language-" + lang[0];
      this.$emit("lang", lang[0]);
    },
    tab() {
      if (document.execCommand("insertText")) {
        document.execCommand("insertText", false, this.tabWidth);
      } else {
        const cursorPosition = this.$refs.textarea.selectionStart;
        this.content =
          this.content.substring(0, cursorPosition) + this.tabWidth + this.content.substring(cursorPosition);
        this.cursorPosition = cursorPosition + this.tabWidth.length;
        this.insertTab = true;
      }
    },
    calcScrollDistance(e) {
      this.$refs.code.isScrolling = true;
      this.top = -e.target.scrollTop;
      this.left = -e.target.scrollLeft;
    },
    resizer() {
      const resizer = new ResizeObserver((entries) => {
        this.scrollBarWidth = entries[0].target.offsetWidth - entries[0].target.clientWidth;
        this.scrollBarHeight = entries[0].target.offsetHeight - entries[0].target.clientHeight;
      });
      if (this.$refs.textarea) {
        resizer.observe(this.$refs.textarea);
      }
    },
    copy() {
      if (document.execCommand("copy")) {
        this.$refs.textarea.select();
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
      } else {
        navigator.clipboard.writeText(this.$refs.textarea.value);
      }
    },
  },
  mounted() {
    this.$emit("lang", this.languages[0][0]);
    this.$emit("content", this.content);
    this.$emit("textarea", this.$refs.textarea);
    this.resizer();
  },
  updated() {
    if (this.insertTab) {
      this.$refs.textarea.setSelectionRange(this.cursorPosition, this.cursorPosition);
      this.insertTab = false;
    }
  },
  template: `
  <div
    :theme="theme"
    class="code-editor"
    :class="{
      'hide-header': withoutHeader,
      scroll: scroll,
      'read-only': readOnly,
      wrap: wrap,
    }"
    :style="{
      width: width,
      height: height,
      zIndex: zIndex,
      maxWidth: maxWidth,
      minWidth: minWidth,
      maxHeight: maxHeight,
      minHeight: minHeight,
    }"
  >
    <div class="hljs" :style="{ borderRadius: borderRadius }">
      <div class="header" v-if="!withoutHeader" :style="{ borderRadius: borderRadius + ' ' + borderRadius + ' 0 0' }">
        <Dropdown
          v-if="displayLanguage"
          :width="langListWidth"
          :title="languageTitle"
          :disabled="languages.length <= 1"
          :defaultDisplay="langListDisplay"
        >
          <ul class="lang-list hljs" :style="{ height: langListHeight }">
            <li v-for="(lang, index) in languages" :key="index" @click="changeLang(lang)">
              {{ lang[1] ? lang[1] : lang[0] }}
            </li>
          </ul>
        </Dropdown>
        <CopyCode @click="copy" v-if="copyCode"></CopyCode>
      </div>
      <div
        class="code-area"
        :style="{ borderRadius: withoutHeader ? borderRadius : '0 0 ' + borderRadius + ' ' + borderRadius }"
      >
        <textarea
          :readOnly="readOnly"
          :style="{ fontSize: fontSize, padding: withoutHeader ? padding : '0 ' + padding + ' ' + padding }"
          ref="textarea"
          :autofocus="autofocus"
          @keydown.tab.prevent.stop="tab"
          @scroll="calcScrollDistance"
          :value="modelValue == undefined ? content : modelValue"
          @input="updateValue"
        ></textarea>
        <pre :style="{ paddingRight: scrollBarWidth + 'px', paddingBottom: scrollBarHeight + 'px' }">
        <code
            ref="code"
            v-highlight="contentValue"
            :class="languageClass"
            :isScrolling="false"
            :style="{ top: top + 'px', left: left + 'px', fontSize: fontSize, padding: withoutHeader ? padding : '0 ' + padding + ' ' + padding }"
        ></code>
      </pre>
      </div>
    </div>
  </div>
`,
};
