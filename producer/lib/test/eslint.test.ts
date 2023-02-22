import { execSync } from "child_process";

describe(__filename, function () {
	it("should pass linter checks", function () {
		execSync("npm run style", { stdio: "inherit" });
	});
});