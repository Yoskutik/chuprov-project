import {observable} from "mobx";

const randInt = (min: number = 0, max: number= 0): number => Math.floor(Math.random() * (max - min) + min);

export default class ViewModel {
    private tokens: string[] = null;

    @observable distances: number[] = [];
    @observable occupancies: number[] = [];
    @observable mapPoints: any[] = [];
    @observable addPerMinute: number = 60;
    @observable removePerMinute: number = 30;

    @observable fireServices: any[] = [];
    @observable policeServices: any[] = [];
    @observable medicalServices: any[] = [];
    @observable gasServices: any[] = [];

    constructor() {
        const users = fetch('http://127.0.0.1:69/api/v1/get_users', {method: 'post'}).then(res => res.json());
        users.then(res => {
            this.tokens = res;
        });

        const services = fetch('http://127.0.0.1:69/api/v1/get_services', {method: 'post'}).then(res => res.json());
        services.then(res => {
            this.fireServices = res.filter(it => it.type === 'Пожарные').map(it => ({...it, value: 30}));
            this.policeServices = res.filter(it => it.type === 'Полиция').map(it => ({...it, value: 30}));
            this.medicalServices = res.filter(it => it.type === 'Скорая').map(it => ({...it, value: 30}));
            this.gasServices = res.filter(it => it.type === 'Газовая').map(it => ({...it, value: 30}));
        });

        Promise.all([users, services]).then(() => {
            this.startAdding();
            this.startRemoving();
            this.startTracking();
        });
    }

    private generateUserData = () => ({
        ip: `${randInt(0, 255)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(0, 255)}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        token: this.tokens[randInt(0, this.tokens.length)],
        service: ['Пожарные', 'Полиция', 'Скорая', 'Газовая'][Math.floor(randInt(0, 4))],
    });

    private startAdding = () => {
        const add = () => {
            setTimeout(() => {
                const data = this.generateUserData();
                fetch('http://127.0.0.1:69/api/v1/find', {
                    method: 'post',
                    body: JSON.stringify(data),
                })
                    .then(res => res.json())
                    .then(res => {
                        const dist = Math.sqrt(
                            (data.x - res.x) ** 2 + (data.y - res.y) ** 2
                        );
                        if (isNaN(dist)) return;
                        this.distances.push(dist);
                        this.mapPoints.push({
                            x: data.x,
                            y: data.y,
                        });
                        setTimeout(() => {
                            this.distances = this.distances.slice();
                            this.mapPoints = this.mapPoints.slice();
                        });
                    });
                add();
            }, 60 * 1000 / this.addPerMinute || 100);
        };
        add();
    };

    private startRemoving = () => {
        const del = () => {
            setTimeout(() => {
                fetch(`http://127.0.0.1:69/api/v1/quit/${Math.floor(Math.random() * 50)}`, {
                    method: 'post',
                })
                del();
            }, 60 * 1000 / this.removePerMinute || 1000);
        };
        del();
    };

    private startTracking = () => {
        setInterval(() => {
            fetch('http://127.0.0.1:69/api/v1/get_occupancy', {
                method: 'post',
            })
                .then(res => res.json())
                .then(res => {
                    this.occupancies.push(res);

                    setTimeout(() => {
                        this.occupancies = this.occupancies.slice();
                    });
                });
        }, 800);
    };

    public makeDDoS = () => {
        const users = Array(10).map(() => this.generateUserData());
        let i = 0;
        const interval = setInterval(() => {
            i++;
            fetch('http://127.0.0.1:69/api/v1/get_occupancy', {
                method: 'POST',
                body: JSON.stringify(users[i % users.length]),
            });
            if (i >= 500) clearInterval(interval);
        }, 10);
    };

    public makeSQLInjection = () => {
        const user = this.generateUserData();
        fetch('http://127.0.0.1:69/api/v1/get_occupancy', {
            method: 'POST',
            body: JSON.stringify({
                ...user,
                token: '1";DROP TABLE users --'
            }),
        })
    };
}
