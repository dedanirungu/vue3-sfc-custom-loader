import * as Vue from 'vue';
import {
    loadModule
} from './vue3-sfc-loader';


const options = {
    moduleCache: {
        vue: Vue
    },
    async getFile(url) {
        const res = await fetch(url)
        if (!res.ok)
            throw Object.assign(new Error(`${res.statusText} ${url}`), { res })
        return await res.text();
    },
    addStyle(textContent) {
        const style = Object.assign(document.createElement("style"), { textContent })
        const ref = document.head.getElementsByTagName("style")[0] || null
        document.head.insertBefore(style, ref)
    },
}

const fetchComponent = (comp_path) => {

    console.log(comp_path);
    let path_url = window.assets_url + '/assets/' + comp_path;

    try {
        return Vue.defineAsyncComponent(() => loadModule(path_url, options));
    } catch (error) {
        throw new Error(`Error raised on file ${comp_path}`);
    }

}

const app = Vue.createApp({
    components: {
        'my-component': Vue.defineAsyncComponent(() => loadModule('https://utupress.github.io/blocks/alert/index.vue', options))
    },
    template: '<div>fsdfsdfsd <my-component></my-component></div>'
});

app.mount('#app');

