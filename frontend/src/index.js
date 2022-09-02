import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import App from './App';
// import RegisterComponent from './components/RegisterComponent';
import * as serviceWorker from './serviceWorker';


ReactDOM.render(
    <I18nextProvider i18n={i18n}>
        <App />
    </I18nextProvider>, 
    document.getElementById('root')
);

// ReactDOM.render(<RegisterComponent />, document.getElementById('register'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
