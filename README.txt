Telegram Inventory bot
A telegram bot designed to help me keep track of my items and their locations

To get started, create a .env file in the root directory with the following variables:
BOT_TOKEN=your_telegram_bot_token
USER_ID=your_telegram_user_id
DB_URL=your_postgresql_connection_string

Set up the database schema by running:
npm run init_db

If you want to populate the database with a pre-defined set of items and locations for testing, use:
npm run test_data

Once the database is initialized, you can start the bot using:
npm start