<template>
  <div class="document-editor">
    <div id="quill-container">
    </div>
    <transition name="document-loading">
      <loading-message
        message="Loading the document editor"
        class="document-loading document-loading--connection"
        v-show="isLoading"
      />
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import LoadingMessage from '@/components/LoadingMessage'

Quill.register('modules/cursors', QuillCursors)

export default {
  components: {
    LoadingMessage
  },
  data() {
    return {
      quillEditor: null,
      // set default loading state
      isLoading: true,
      incomingDeltas: [],
      retries: 0,
      selectionPosition: {
        index: 0,
        length: 0
      },
      authorId: null
    }
  },
  computed: {
    ...mapState({
      currentSession: state => state.user.session
    })
  },
  mounted() {
    this.quillEditor = new Quill('#quill-container', {
      placeholder: 'Type or paste something...',
      theme: 'snow',
      formats: [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'color',
        'background',
        'list'
      ],
      modules: {
        cursors: {
          selectionChangeSource: 'cursor-api',
          transformOnTextChange: true
        },
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }]
        ]
      }
    })
    // do not allow user to make edits until the quill doc contents are set
    this.quillEditor.disable()

    this.quillEditor.on('text-change', this.quillTextChange)
    this.quillEditor.on('selection-change', this.quillSelectionChange)

    this.$socket.emit('requestQuillState', {
      sessionId: this.currentSession._id
    })

    this.quillEditor
      .getModule('cursors')
      .createCursor('partnerCursor', 'Partner', '#16D2AA')
  },
  methods: {
    quillTextChange(delta, oldDelta, source) {
      if (source === 'user') {

        // Should I set a null position to 0??
        let selectionPosition = this.quillEditor.getSelection()

        // // New line character, have cursor follow its position
        if (
          delta.ops[0].insert === '\n' ||
          (delta.ops[1] && delta.ops[1].insert === '\n')
        )
          selectionPosition = {
            index: selectionPosition.index + 1,
            length: selectionPosition.length,
          }

        // // First insert onto the doc
        // if (typeof delta.ops[0].insert === 'string')
        //   this.quillEditor.deleteText(0, 1)
        // // ???
        // else if (
        //   typeof delta.ops[0].retain === 'number' &&
        //   typeof delta.ops[1].delete === 'number'
        // )
        //   this.quillEditor.deleteText(
        //     delta.ops[0].retain + delta.ops[1].delete,
        //     1
        //   )
        // // if just retaining a character position
        // else if (typeof delta.ops[0].retain === 'number')
        //   this.quillEditor.deleteText(delta.ops[0].retain, 1)
        // // if deleting new line characters
        // else if (typeof delta.ops[0].delete === 'number')
        //   this.quillEditor.deleteText(delta.ops[0].delete, 1)

        this.selectionPosition = Object.assign({}, selectionPosition)

        this.authorId = this.$socket.id
        delta.authorId = this.authorId
        this.quillEditor.setContents(oldDelta)
        this.$socket.emit('transmitQuillDelta', {
          sessionId: this.currentSession._id,
          delta
        })
      }
    },

    quillSelectionChange(range, oldRange, source) {
      if (source === 'user') {
        this.$socket.emit('transmitQuillSelection', {
          sessionId: this.currentSession._id,
          range
        })
      }
    },
    updateContents(delta){
      this.quillEditor.updateContents(delta)
    },
    emptyIncomingDeltas(){
      for (const delta of this.incomingDeltas){
        this.updateContents(delta)
      }
    }
  },
  sockets: {
    quillState({ delta }) {
      this.quillEditor.setContents(delta)
      this.emptyIncomingDeltas()
      this.isLoading = false
      this.quillEditor.enable()
    },

    partnerQuillDelta({ delta }) {
      if (this.isLoading) this.incomingDeltas.push(delta)
      else {
        this.updateContents(delta)

        if (this.authorId === delta.authorId)
          this.quillEditor.setSelection(this.selectionPosition)
      }
    },

    quillPartnerSelection({ range }) {
      this.quillEditor.getModule('cursors').moveCursor('partnerCursor', range)
    },

    /**
     * 
     * This event lets us know the last delta that was composed to the Quill 
     * document in our server cache
     * 
     * If the last delta stored is found in our `incomingDeltas` queue,
     * that means the requested quill state from our server contains 
     * the last delta stored and the ones before it. Remove those from 
     * `incomingDeltas` to avoid appending duplicate deltas to the client Quill doc
     * 
     */
    lastDeltaStored({ delta }) {
      if (delta) {
        const queueCutoff = this.incomingDeltas.findIndex(
          pendingDelta => pendingDelta.id === delta.id
        )
        this.incomingDeltas = this.incomingDeltas.slice(queueCutoff + 1)
      }
    },

    // TODO: needs better UX. What should happen if 10 attempts are reached?
    retryLoadingDoc() {
      const maxRetries = 10
      if (this.retries > maxRetries) return 
      
      this.retries++
      this.$socket.emit('requestQuillState', {
        sessionId: this.currentSession._id
      })
    }
  }
}
</script>

<style lang="scss">
.document-editor {
  height: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  position: relative;

  .ql-container.ql-snow {
    overflow: scroll;
    border: none;
  }

  .ql-toolbar.ql-snow {
    border-width: 0 0 1px 0;
    border-color: $c-border-grey;
  }

  .ql-cursor-flag {
    display: none;
  }
}

.document-loading {
  width: 100%;
  background-color: $c-shadow-warn;
  color: #fff;
  font-weight: normal;
  min-height: 40px;
  // !important is used to override the position specified in the LoadingMessage component
  position: absolute !important;
  left: 0;
  top: 40px;
  padding: 12px;
  z-index: 1000;
  transition: all 0.15s ease-in;
  text-align: center;

  &--connection {
    background-color: rgba(110, 140, 171, 0.87);
  }
}
</style>
