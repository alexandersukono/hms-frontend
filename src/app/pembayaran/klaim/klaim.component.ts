import { Component }				from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import * as _ from "lodash";

import { Klaim }				from './klaim';
import { KlaimService }		from './klaim.service';
import { Asuransi }				from '../../pasien/asuransi';
import { AsuransiService }		from '../../pasien/asuransi.service';
import { ENV }					from '../../environment';

@Component({
 	selector: 'klaim-page',
 	templateUrl: './klaim.component.html',
 	providers: [KlaimService, AsuransiService]
})

export class KlaimComponent {
	private klaimUrl = ENV.klaimUrl;


	tanggal_awal: string;
	tanggal_akhir: string;
	loading: boolean;
	response: any;
	allKlaim: any[];
	allAsuransi = ['', 'tunai'];

	config = {
		"format": "YYYY-MM-DD"
	};

	public rowsOnPage = 10;
    public sortBy = "tanggal";
    public sortOrder = "desc";

	constructor(
		private klaimService: KlaimService,
		private asuransiService: AsuransiService,
		private toastyService: ToastyService, 
		private toastyConfig: ToastyConfig
	) {}

	private initAsuransiList(items: Asuransi[]): void {
		for (let item of _.uniqBy(items, 'nama_asuransi')) {
			this.allAsuransi.push(item.nama_asuransi);
		}
	}

	ngOnInit(): void {
		this.tanggal_awal = null;
		this.tanggal_akhir = null;
		this.loading = true;
		this.asuransiService.getAllAsuransi()
			.subscribe(allAsuransi => this.initAsuransiList(allAsuransi));

		this.klaimService.getAllKlaim()
			.subscribe(data => {
				this.response = data;
				this.allKlaim = this.response.allKlaim;
				console.log(this.allKlaim);
				this.loading = false;
			});
	}

	public download() {
		if ((this.tanggal_awal === null || this.tanggal_awal === '') && (this.tanggal_akhir === null || this.tanggal_akhir === '')) {
			this.toastyService.error(this.toast_fail(3));
		}
		else {
			if (this.tanggal_awal === null || this.tanggal_awal === '') {
				this.toastyService.error(this.toast_fail(1));
			}
			else {
				if (this.tanggal_akhir === null || this.tanggal_akhir === '') {
					this.toastyService.error(this.toast_fail(2));
				}
				else {
				    window.location.href = this.klaimUrl + '/export?tanggal_awal=' + this.tanggal_awal + '&tanggal_akhir=' + this.tanggal_akhir;
				    this.toastyService.success(this.toast_success());
					this.ngOnInit();
				}
			}
		}
	}

	private toast_success() {
		let toastOptions:ToastOptions = {
			title: "Mengunduh...",
			msg: '',
			showClose: true,
			timeout: 1000,
			theme: 'material'
		};

		return toastOptions;
	}

	private toast_fail(value) {
		let title: string = ''
		if (value === 1) {
			title = 'Tanggal mulai tidak boleh kosong';
		} 
		else {
			if (value === 2) {
				title = 'Tanggal selesai tidak boleh kosong';
			}
			else {
				title = 'Tanggal mulai dan tanggal selesai tidak boleh kosong';
			}
		}
		let toastOptions:ToastOptions = {
			title: title,
			msg: '',
			showClose: true,
			timeout: 5000,
			theme: 'material'
		};

		return toastOptions;
	}
}