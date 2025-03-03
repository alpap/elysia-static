import { Elysia } from 'elysia'
import { staticPlugin } from '../src'

import { describe, expect, it } from 'bun:test'

const req = (path: string) => new Request(`http://localhost${path}`)

const takodachi = await Bun.file('public/takodachi.png').text()

describe('Static Plugin', () => {
    it('should get root path', async () => {
        const app = new Elysia().use(staticPlugin())

        await app.modules

        const res = await app
            .handle(req('/public/takodachi.png'))
            .then((r) => r.blob())
            .then((r) => r.text())

        expect(res).toBe(takodachi)
    })

    it('should get nested path', async () => {
        const app = new Elysia().use(staticPlugin())

        await app.modules

        const res = await app.handle(req('/public/nested/takodachi.png'))
        const blob = await res.blob()
        expect(await blob.text()).toBe(takodachi)
    })

    it('should get different path', async () => {
        const app = new Elysia().use(
            staticPlugin({
                assets: 'public-aliased'
            })
        )

        await app.modules

        const res = await app.handle(req('/public/tako.png'))
        const blob = await res.blob()
        expect(await blob.text()).toBe(takodachi)
    })

    it('should handle prefix', async () => {
        const app = new Elysia().use(
            staticPlugin({
                prefix: '/static'
            })
        )

        await app.modules

        const res = await app.handle(req('/static/takodachi.png'))
        const blob = await res.blob()
        expect(await blob.text()).toBe(takodachi)
    })

    it('should handle empty prefix', async () => {
        const app = new Elysia().use(
            staticPlugin({
                prefix: ''
            })
        )

        await app.modules

        const res = await app.handle(req('/takodachi.png'))
        const blob = await res.blob()
        expect(await blob.text()).toBe(takodachi)
    })

    it('should supports multiple public', async () => {
        const app = new Elysia()
            .use(
                staticPlugin({
                    prefix: '/public-aliased',
                    assets: 'public-aliased'
                })
            )
            .use(
                staticPlugin({
                    prefix: '/public'
                })
            )

        await app.modules

        const res = await app.handle(req('/public/takodachi.png'))
        const blob = await res.blob()
        expect(await blob.text()).toBe(takodachi)
    })

    it('should supports mixed folder', async () => {
        const app = new Elysia()
            .use(
                staticPlugin({
                    assets: 'public-aliased'
                })
            )
            .use(staticPlugin())

        await app.modules

        const file1 = await app.handle(req('/public/takodachi.png'))
        const file2 = await app.handle(req('/public/takodachi.png'))
        const blob1 = await file1.blob()
        const blob2 = await file2.blob()

        expect(await blob1.text()).toBe(takodachi)
        expect(await blob2.text()).toBe(takodachi)
    })

    it('ignore string pattern', async () => {
        const app = new Elysia().use(
            staticPlugin({
                ignorePatterns: ['public/takodachi.png']
            })
        )

        await app.modules

        const res = await app.handle(req('/public/takodachi.png'))
        const blob = await res.blob()
        expect(await blob.text()).toBe('NOT_FOUND')
    })

    it('ignore regex pattern', async () => {
        const app = new Elysia()
            .use(
                await staticPlugin({
                    ignorePatterns: [/takodachi.png$/]
                })
            )
            .use(
                await staticPlugin({
                    assets: 'public-aliased',
                    ignorePatterns: [/takodachi.png$/]
                })
            )

        const file1 = await app.handle(req('/public/takodachi.png'))
        const file2 = await app.handle(req('/public/tako.png'))
        const blob1 = await file1.blob()
        const blob2 = await file2.blob()

        expect(await blob1.text()).toBe('NOT_FOUND')
        expect(await blob2.text()).toBe(takodachi)
    })

    it('always static', async () => {
        const app = new Elysia().use(
            staticPlugin({
                alwaysStatic: true
            })
        )

        await app.modules

        const res = await app
            .handle(req('/public/takodachi.png'))
            .then((r) => r.blob())
            .then((r) => r.text())

        expect(res).toBe(takodachi)
    })

    it('exclude extension', async () => {
        const app = new Elysia().use(
            staticPlugin({
                alwaysStatic: true,
                noExtension: true
            })
        )

        await app.modules

        const res = await app
            .handle(req('/public/takodachi'))
            .then((r) => r.blob())
            .then((r) => r.text())

        expect(res).toBe(takodachi)
    })
})
