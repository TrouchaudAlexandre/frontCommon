import {reactive, toRefs} from 'vue';
import type { Ref } from 'vue';

interface UseLoader {
    getByKey: (key: string) => Ref<boolean>;
    setByKey: (key: string, isLoading: boolean) => void;
}

const loaders = reactive<{ [key: string]: boolean }>({});

export function useLoader() {
    function initialiseLoader(key: string): void {
        if (loaders[key] === undefined) {
            loaders[key] = false;
        }
    }

    function getByKey(key: string): Ref<boolean> {
        initialiseLoader(key);
        return toRefs(loaders)[key];
    }

    function setByKey(key: string, isLoading: boolean): void {
        initialiseLoader(key);
        loaders[key] = isLoading;
    }

    return {
        getByKey,
        setByKey,
    };
}

