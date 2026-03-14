import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function viewloc(ctx: Context, pool: Pool, locationId: string){
    try {
        const locRes = await pool.query('SELECT name FROM locations WHERE id = $1', [locationId]);
        if (locRes.rows.length === 0) {
            return ctx.answerCbQuery('локации нет', { show_alert: true });
        }
        const locName = locRes.rows[0].name;

        const itemsRes = await pool.query('SELECT name FROM items WHERE location_id = $1 ORDER BY created_at ASC', [locationId]);
        if (itemsRes.rows.length === 0) {
            return ctx.answerCbQuery(`в ${locName} ничего нет`, { show_alert: true });
        }

        let replyText = `${locName}:\n\n`;
        itemsRes.rows.forEach((item, index) => {
            replyText += `${index + 1}. ${item.name}\n`;
        });
        await ctx.reply(replyText);
        await ctx.answerCbQuery();

    } catch (error) {
        console.error('ошибка', error);
        ctx.answerCbQuery('ошибка при поиске вещей', { show_alert: true });
    }
}