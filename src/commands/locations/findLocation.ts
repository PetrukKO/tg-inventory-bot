import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function findLocation(ctx: Context, pool: Pool) {
    if (!ctx.message || !('text' in ctx.message)) return;

    const searchQuery = ctx.message.text.replace('/find_location', '').trim();

    if (!searchQuery) {
        return ctx.reply('правильный формат: find_location коробка');
    }

    try {
        const query = `
            SELECT 
                l.id AS loc_id, 
                l.name AS loc_name, 
                l.whereabouts, 
                i.name AS item_name 
            FROM locations l
            LEFT JOIN items i ON l.id = i.location_id
            WHERE l.name ILIKE $1
            ORDER BY l.id ASC, i.id ASC
        `;
        
        const res = await pool.query(query, [`%${searchQuery}%`]);

        if (res.rows.length === 0) {
            return ctx.reply(`нет ни одной локации, в названии которой есть ${searchQuery}`);
        }
        const locationsMap = new Map<number, { name: string, whereabouts: string, items: string[] }>();

        res.rows.forEach(row => {
            if (!locationsMap.has(row.loc_id)) {
                locationsMap.set(row.loc_id, {
                    name: row.loc_name,
                    whereabouts: row.whereabouts,
                    items: []
                });
            }
            
            if (row.item_name) {
                locationsMap.get(row.loc_id)!.items.push(row.item_name);
            }
        });

        let replyText = `найденные локации по запросу: ${searchQuery}\n\n`;

        const uniqueLocations = new Map<number, { name: string, whereabouts: string }>();
        
        res.rows.forEach(row => {
            if (!uniqueLocations.has(row.loc_id)) {
                uniqueLocations.set(row.loc_id, {
                    name: row.loc_name,
                    whereabouts: row.whereabouts
                });
            }
        });

        const buttons = Array.from(uniqueLocations.entries()).map(([locId, locData]) => {
            const safeLocName = locData.name;
            const safeDesc = locData.whereabouts ? ` (${locData.whereabouts})` : '';
            
            return Markup.button.callback(`${safeLocName}${safeDesc}`, `viewloc_${locId}`);
        });

        const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 });

        await ctx.reply(`найденные локации по запросу ${searchQuery}:`, {
            ...keyboard,
        });
        if (replyText.length > 4000) {
            replyText = replyText.substring(0, 4000) + 'показаны не все результаты, уточни запрос';
        }

        await ctx.reply(replyText, { parse_mode: 'HTML' });

    } catch (error) {
        console.error('ошибка про поиске локации ', error);
        ctx.reply('ошибка бд при поиске локации');
    }
}