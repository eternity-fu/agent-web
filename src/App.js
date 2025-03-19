import React, {useState} from 'react';
import Sidebar from './Components/Sidebar/Sidebar';
import TeamBuilder from './Pages/TeamBuilder';
import Session from './Pages/Session';
import Gallery from './Pages/Gallery';
import './App.css';
import {DataProvider} from './Contexts/DataContext'; // 引入 DataProvider


const App = () => {
    const [activePage, setActivePage] = useState('Session');

    const handleItemClick = (page) => {
        setActivePage(page);
    };

    const renderPage = () => {
        switch (activePage) {
            case 'TeamBuilder':
                return <TeamBuilder/>;
            case 'Session':
                return <Session/>;
            case 'Gallery':
                return <Gallery/>;
            default:
                return <div>Home Content</div>;
        }
    };

    return (
        <DataProvider>
            <div className="app">
                <Sidebar activePage={activePage} onItemClick={handleItemClick}/>
                <div className="content">{renderPage()}</div>
            </div>
        </DataProvider>
    );
};

export default App;