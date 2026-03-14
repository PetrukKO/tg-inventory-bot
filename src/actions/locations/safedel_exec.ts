import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function safedel_exec(ctx: Context, pool: Pool, sourceId: string, destId: string) {
    try {
        const namesRes = await pool.query('SELECT id, name FROM locations WHERE id IN ($1, $2)', [sourceId, destId]);
        const sourceName = namesRes.rows.find(r => r.id == sourceId)?.name;
        const destName = namesRes.rows.find(r => r.id == destId)?.name;

        const updateRes = await pool.query('UPDATE items SET location_id = $1 WHERE location_id = $2 RETURNING id', [destId, sourceId]);
        const movedCount = updateRes.rowCount;

        await pool.query('DELETE FROM locations WHERE id = $1', [sourceId]);

        await ctx.editMessageText(
            `локация ${sourceName} удалена.\n вещи (${movedCount} шт.) перенесены в ${destName}`
        );

    } catch (error) {
        console.error('ошибка при удалении', error);
        if (ctx.callbackQuery) await ctx.answerCbQuery('ошибка при переносе и удалении', { show_alert: true });
    }
}