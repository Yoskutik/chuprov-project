import React from 'react';
import ReactDOM from 'react-dom';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Scatter, ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
    ZAxis
} from "recharts";
import {observer} from "mobx-react-lite";
import {ma} from "moving-averages";
import ViewModel from "./viewModel";
import './style.scss';

const Chart = ({data, dataKey}) => (
    <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" tickCount={10} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={dataKey} stroke="#8884d8" activeDot={{ r: 4 }} />
        </LineChart>
    </ResponsiveContainer>
);

const map = (arr, name) => {
    return ma(arr.slice(-30), 3).slice(3).map((it, i) => ({x: i, [name]: it}));
};

const viewModel = new ViewModel();

const App = observer(() => {
    return (
        <div className="app">
            <div style={{ display: 'flex' }}>
                <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height={620}>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="x" tickCount={10} domain={[0, 100]} interval={0} />
                            <YAxis type="number" dataKey="y" tickCount={10} domain={[0, 100]} interval={0} />
                            <ZAxis dataKey="value" type="number" range={[0, 30]} />
                            <Tooltip />
                            <Legend />
                            <Scatter name="Новые вызовы" data={viewModel.mapPoints.slice(-30).map((it, i) => ({...it, value: viewModel.mapPoints.length > 30 ? i : 30 - viewModel.mapPoints.length + i}))} fill="#000" />
                            <Scatter name="Пожарные" data={viewModel.fireServices} fill="rgba(255, 37, 37, 1)" shape="triangle" />
                            <Scatter name="Полиция" data={viewModel.policeServices} fill="rgba(37, 255, 37, 1)" shape="triangle" />
                            <Scatter name="Скорая" data={viewModel.medicalServices} fill="rgba(240, 240, 240, 1)" shape="triangle" />
                            <Scatter name="Газовая" data={viewModel.gasServices} fill="rgba(202, 202, 7, 1)" shape="triangle" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
                    <Chart data={map(viewModel.distances, 'Среднее расстояние до сервиса')} dataKey='Среднее расстояние до сервиса' />
                    <Chart data={viewModel.occupancies.slice(-30).map((it, i) => ({x: i, 'Средняя заполненность сервисов': it}))} dataKey='Средняя заполненность сервисов' />
                </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
                <form>
                    <label>Добавляется в минуту:</label>
                    <input value={viewModel.addPerMinute} onChange={evt => viewModel.addPerMinute = +evt.target.value} />
                    <label>Удаляется в минуту:</label>
                    <input value={viewModel.removePerMinute} onChange={evt => viewModel.removePerMinute = +evt.target.value} />
                </form>
                <div style={{ marginLeft: 20 }}>
                    <button onClick={viewModel.makeDDoS} style={{ marginRight: 10 }}>
                        ЗаDDoS'им
                    </button>
                    <button onClick={viewModel.makeSQLInjection}>
                        Инъекция SQL
                    </button>
                </div>
            </div>
        </div>
    );
});

ReactDOM.render(
    <App />,
    document.querySelector('#root'),
);
