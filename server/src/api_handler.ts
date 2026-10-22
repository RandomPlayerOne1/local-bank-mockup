import fs from 'fs/promises'
import Module from 'module';

const PUBLIC_API_PATH = "./src/public_api"

let LoadedAPIs: { public: Record<string, Module>; private: Record<string, Module> } = {
    "public": {},
    "private": {}
}

async function InitializeAPIs() {
    try {

        const public_apis = await fs.readdir(PUBLIC_API_PATH);

        console.log("Public APIs: ", public_apis);

        const module_path = PUBLIC_API_PATH.replace("./src", ".");

        const imports_public = public_apis.map(async (file_name) => {
            const js_name = file_name.replace("/\.[^/.]+$/", ".js");
            const full_path = module_path + "/" + js_name;
            const module_name: string = js_name.replace(".js", "");

            const module = await import(full_path);

            return [module_name, module] as const;
        });

        const public_result = await Promise.all(imports_public);

        for (const [module_name, module] of public_result) {
            LoadedAPIs.public[module_name] = module;
        }

    } catch (err) {
        console.log(`Error while trying to initialize API: ${err}`);
    }
}

export default InitializeAPIs