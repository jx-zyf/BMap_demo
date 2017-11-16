
export default {

    namespace: 'map',

    state: {
        position: {
            lng: 116.404,
            lat: 39.915,
            address: "天安门"
        },
        curPos: {
            lng: 0,
            lat: 0,
            address: ''
        },
    },

    subscriptions: {
        setup({ dispatch, history }) {  // eslint-disable-line
        },
    },

    effects: {
        *fetch({ payload }, { call, put }) {  // eslint-disable-line
            yield put({ type: 'save' });
        },
    },

    reducers: {
        curLoc(state, action) {
            return { ...state, ...action.payload };
        },
        search(state, action) {
            return { ...state, ...action.payload };
        },
    },

};
