// import React from 'react'
import ReactDOM from 'react-dom/client'
// import { persistStore } from 'redux-persist'
// import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import { store } from 'store'

// let persistor = persistStore(store);

const rootElement = document.getElementById('app-root');
if(rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        // <React.StrictMode>
            <Provider store={store}>
                {/* <PersistGate loading={null} persistor={persistor}> */}
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                {/* </PersistGate> */}
            </Provider>
        // </React.StrictMode>
    )
}
