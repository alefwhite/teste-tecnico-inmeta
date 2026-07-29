import { app } from "./app";
import { env } from "./shared/config/env";

app
	.listen({
		host: "0.0.0.0",
		port: Number(env.PORT) || 3333,
	})
	.then(() => {
		console.log("Server is running on port: ", env.PORT);
		console.log(`Swagger Docs: http://localhost:${env.PORT}/docs`);
	});
