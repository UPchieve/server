// // my-custom-environment
// const NodeEnvironment = require('jest-environment-node').TestEnvironment

// class CustomEnvironment extends NodeEnvironment {
//   constructor(config: { globalConfig: any; projectConfig: any }, context: { testPath: any; docblockPragmas: any }) {
//     super(config, context)
//     console.log(config.globalConfig)
//     console.log(config.projectConfig)
//     this.testPath = context.testPath
//     this.docblockPragmas = context.docblockPragmas
//   }

//   async setup() {
//     await super.setup()
//     // await someSetupTasks(this.testPath)
//     this.global.someGlobalObject = createGlobalObject()

//     // Will trigger if docblock contains @my-custom-pragma my-pragma-value
//     if (this.docblockPragmas['my-custom-pragma'] === 'my-pragma-value') {
//       // ...
//     }
//   }

//   async teardown() {
//     this.global.someGlobalObject = destroyGlobalObject()
//     await someTeardownTasks()
//     await super.teardown()
//   }

//   getVmContext() {
//     return super.getVmContext()
//   }

//   async handleTestEvent(event: { name: string }, state: any) {
//     if (event.name === 'test_start') {
//       // ...
//     }
//   }
// }

// module.exports = CustomEnvironment
