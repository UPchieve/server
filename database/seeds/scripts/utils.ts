import { Ulid } from 'id128'

export function getDbUlid() {
    return Ulid.generate().toRaw()
}
