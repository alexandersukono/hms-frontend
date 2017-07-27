import { Injectable }		  from '@angular/core';
import { Headers, Http, Response, RequestOptions }		from '@angular/http';
import { Observable }			from 'rxjs/Rx';

import { ENV }						from '../environment';
import { Pasien }	        from './pasien';
import { RekamMedis }     from './rekam-medis';

import * as _ from "lodash";

@Injectable()
export class RekamMedisService {
	private pasienUrl = ENV.pasienUrl;
  private rekamMedisUrl = ENV.rekamMedisUrl;

	constructor(private http:Http) { }

	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error);
		return Promise.reject(error.message || error);
	}

	getAllRekamMedis(): Observable<RekamMedis[]> {
		return this.http.get(this.rekamMedisUrl)
			.map((res: Response) => res.json());
	}

	getAllRekamMedisOfPasien(id_pasien: number): Observable<RekamMedis[]> {
		return this.http.get(this.rekamMedisUrl + '/' + id_pasien)
			.map((res: Response) => res.json());
	}

/*	getAllAnamnesisOfPasien(id_pasien: number): any {
		this.getAllRekamMedisOfPasien(id_pasien)
			.map(allRekamMedis => {
				console.log(allRekamMedis);
				let allAnamnesis: any[] = [];
				_.each(allRekamMedis, rekamMedis => {
					let anamnesis: any = JSON.parse(rekamMedis.anamnesis);
					allAnamnesis.push(anamnesis);
				});
				return allAnamnesis;
			});
	}*/

	getRekamMedisOfPasien(id_pasien: number, no_entry: number): Observable<any> {
		return this.getAllRekamMedisOfPasien(id_pasien)
			.map(allRekamMedis => _.set(allRekamMedis[no_entry], 'num_entries', allRekamMedis.length));
	}

	createRekamMedis(rekamMedis: RekamMedis) {
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({headers: headers});
		let body = JSON.stringify(rekamMedis);
		return this.http.post(this.rekamMedisUrl, body, options)
			.map((res: Response) => res.json());
	}

	updateRekamMedis(rekamMedis: RekamMedis) {
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({headers: headers});
		let body = JSON.stringify(rekamMedis);
		return this.http.put(this.rekamMedisUrl + '/' + rekamMedis.id_pasien + '/' + rekamMedis.tanggal_waktu, body, options)
			.map((res: Response) => res.json());
	}

	destroyRekamMedis(id_pasien: number, tanggal_waktu: string) {
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({headers: headers});
		return this.http.delete(this.pasienUrl + '/' + id_pasien + '/' + tanggal_waktu, options)
			.map((res: Response) => res.json());
	}
}
