import NodeEnvironment from 'jest-environment-node'
import configReader from './config'
import { Script } from 'vm'
import {
  AllStartedContainersAndMetaInfo,
  startAllContainers,
} from './containers'
import { StartedTestContainer } from 'testcontainers'

export function setGlobalsFromEnv(globals: any, env: any) {
  const envKeys = Object.keys(env)

  envKeys.forEach(key => {
    // @ts-ignore
    globals[key] = env[key]
  })
}

const createEnv = (name: string, key: string) =>
  `__TESTCONTAINERS_${name.toUpperCase()}_${key.toUpperCase()}__`

function createGlobalVariablesFromMetaInfos(
  metaInfos: AllStartedContainersAndMetaInfo
) {
  const containerKeys = Object.keys(metaInfos)

  return containerKeys.reduce((acc: any, containerKey: string, idx: number) => {
    const { ip, name, portMappings } = metaInfos[containerKey]

    acc[createEnv(containerKey, 'IP')] = ip
    acc[createEnv(containerKey, 'NAME')] = name
    for (const [originalPort, boundPort] of portMappings.entries()) {
      acc[createEnv(containerKey, `PORT_${originalPort}`)] = boundPort
    }

    return acc
  }, {})
}

export class TestcontainersEnvironment extends NodeEnvironment {
  __TESTCONTAINERS__: StartedTestContainer[] = []

  constructor(config: any, context: any) {
    // @ts-ignore
    super(config, context)
  }

  public async setup() {
    const jestTestcontainersConfig = configReader()
    const allStartedContainersMetaInfo = await startAllContainers(
      jestTestcontainersConfig
    )
    const globalEnv = createGlobalVariablesFromMetaInfos(
      allStartedContainersMetaInfo
    )

    // @ts-ignore
    this.__TESTCONTAINERS__ = Object.values(allStartedContainersMetaInfo).map(
      ({ container }) => container
    )

    setGlobalsFromEnv(this.global, globalEnv)
    await super.setup()
  }

  public async teardown() {
    await Promise.all(
      this.__TESTCONTAINERS__.map((container: any) => container.stop())
    )
    await super.teardown()
  }

  public runScript<T = any>(script: Script): T | null {
    // @ts-ignore
    return super.runScript(script)
  }
}

export default TestcontainersEnvironment
