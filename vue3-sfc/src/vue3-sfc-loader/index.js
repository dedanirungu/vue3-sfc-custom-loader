import {
	loadModuleInternal
} from './tools'




/**
 * the version of Vue that is expected by the library
 */

export { createCJSModule } from './tools'

/**
 * @internal
 */
function throwNotDefined(details) {

	throw new ReferenceError(`${ details } is not defined`);
}


/**
 * Default resolve implementation
 * resolve() should handle 3 situations :
 *  - resolve a relative path ( eg. import './details.vue' )
 *  - resolve an absolute path ( eg. import '/components/card.vue' )
 *  - resolve a module name ( eg. import { format } from 'date-fns' )
 */
const defaultPathResolve  = ({ refPath, relPath } ) => {

	// initial resolution: refPath is not defined
	if ( refPath === undefined )
		return relPath;

	const relPathStr = relPath.toString();
	
	// is non-relative path ?
	if ( relPathStr[0] !== '.' )
		return relPath;
		
	// note :
	//  normalize('./test') -> 'test'
	//  normalize('/test') -> '/test'

	return relPathStr;
}

/**
 * Default getResource implementation
 * by default, getContent() use the file extension as file type.
 */
function defaultGetResource(pathCx , options ) {

	const { pathResolve, getFile, log } = options;
	const path = pathResolve(pathCx);
	const pathStr = path.toString();
	return {
		id: pathStr,
		path: path,
		getContent: async () => {

			const res = await getFile(path);

			if ( typeof res === 'string' || res instanceof ArrayBuffer ) {

				return {
					type: 'vue',
					getContentData: async (asBinary) => {

						if ( res instanceof ArrayBuffer !== asBinary )
							log?.('warn', `unexpected data type. ${ asBinary ? 'binary' : 'string' } is expected for "${ path }"`);
						
						return res;
					},
				}
			}

			return {
				type: res.type ?? 'vue',
				getContentData: res.getContentData,
			}
		}
	};
}


/**
 * This is the main function.
 * This function is intended to be used only to load the entry point of your application.
 * If for some reason you need to use it in your components, be sure to share at least the options.`compiledCache` object between all calls.
 *
 * @param path  The path of the `.vue` file. If path is not a path (eg. an string ID), your [[getFile]] function must return a [[File]] object.
 * @param options  The options
 * @returns A Promise of the component
 *
 * **example using `Vue.defineAsyncComponent`:**
 *
 * ```javascript
 *
 *	const app = Vue.createApp({
 *		components: {
 *			'my-component': Vue.defineAsyncComponent( () => loadModule('./myComponent.vue', options) )
 *		},
 *		template: '<my-component></my-component>'
 *	});
 *
 * ```
 *
 * **example using `await`:**
 *
 * ```javascript

 * ;(async () => {
 *
 *		const app = Vue.createApp({
 *			components: {
 *				'my-component': await loadModule('./myComponent.vue', options)
 *			},
 *			template: '<my-component></my-component>'
 *		});
 *
 * })()
 * .catch(ex => console.error(ex));
 *
 * ```
 *
 */
export async function loadModule(path , options  = throwNotDefined('options')) {
	const {
		moduleCache = throwNotDefined('options.moduleCache'),
		getFile = throwNotDefined('options.getFile()'),
		addStyle = throwNotDefined('options.addStyle()'),
		pathResolve = defaultPathResolve,
		getResource = defaultGetResource,
	} = options;

	// moduleCache should be defined with Object.create(null). require('constructor') etc... should not be a default module
	if ( moduleCache instanceof Object )
		Object.setPrototypeOf(moduleCache, null);

	const normalizedOptions = {
		moduleCache,
		pathResolve,
		getResource,
		...options,
	};

	return await loadModuleInternal( { refPath: undefined, relPath: path }, normalizedOptions);
}

/**
 * Convert a function to template processor interface (consolidate)
 */
 export function buildTemplateProcessor(processor) {
	return {
		render: (source, preprocessOptions, cb) => {
			try {
				const ret = processor(source, preprocessOptions)
				if (typeof ret === 'string') {
					cb(null, ret)
				} else {
					ret.then(processed => {
						cb(null, processed)
					})
					ret.catch(err => {
						cb(err, null)
					})
				}
			} catch (err) {
				cb(err, null)
			}
		}
	}
}