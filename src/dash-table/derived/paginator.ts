import { merge } from 'ramda';

import { memoizeOneFactory } from 'core/memoizer';

import { clearSelection } from 'dash-table/utils/actions';

import {
    Data,
    PaginationMode,
    SetProps,
    IPaginationSettings
} from 'dash-table/components/Table/props';

export interface IPaginator {
    loadNext(): void;
    loadPrevious(): void;
}

function getBackEndPagination(
    pagination_settings: IPaginationSettings,
    setProps: SetProps
): IPaginator {
    return {
        loadNext: () => {
            pagination_settings.current_page++;
            setProps({ pagination_settings, ...clearSelection });
        },
        loadPrevious: () => {
            if (pagination_settings.current_page <= 0) {
                return;
            }

            pagination_settings.current_page--;
            setProps({ pagination_settings, ...clearSelection });
        }
    };
}

function getFrontEndPagination(
    pagination_settings: IPaginationSettings,
    setProps: SetProps,
    data: Data
) {
    return {
        loadNext: () => {
            let maxPageIndex = Math.floor(data.length / pagination_settings.page_size);

            if (pagination_settings.current_page >= maxPageIndex) {
                return;
            }

            pagination_settings = merge(pagination_settings, {
                current_page: pagination_settings.current_page + 1
            });

            setProps({ pagination_settings, ...clearSelection });
        },
        loadPrevious: () => {
            if (pagination_settings.current_page <= 0) {
                return;
            }

            pagination_settings = merge(pagination_settings, {
                current_page: pagination_settings.current_page - 1
            });

            setProps({ pagination_settings, ...clearSelection });
        }
    };
}

function getNoPagination() {
    return {
        loadNext: () => { },
        loadPrevious: () => { }
    };
}

const getter = (
    pagination_mode: PaginationMode,
    pagination_settings: IPaginationSettings,
    setProps: SetProps,
    data: Data
): IPaginator => {
    switch (pagination_mode) {
        case false:
            return getNoPagination();
        case true:
        case 'fe':
            return getFrontEndPagination(pagination_settings, setProps, data);
        case 'be':
            return getBackEndPagination(pagination_settings, setProps);
        default:
            throw new Error(`Unknown pagination mode: '${pagination_mode}'`);
    }
};

export default memoizeOneFactory(getter);
