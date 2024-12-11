/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://ai-interview-mocker_owner:FISJTxrc7E4v@ep-twilight-grass-a5b1cqdw.us-east-2.aws.neon.tech/ai-interview-mocker?sslmode=require',
    }
  };
  