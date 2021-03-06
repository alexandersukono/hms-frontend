import { Component, OnInit }		from '@angular/core';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';

import { Rawatinap } 				from './rawatinap';
import { RawatinapService }		    from './rawatinap.service';
import { Tempattidur }		    from './tempattidur';
import { TempattidurService }		    from './tempattidur.service';
import { PemakaianKamar } 				from './pemakaian-kamar';
import { PemakaianKamarService }		    from './pemakaian-kamar.service';

@Component({
 	selector: 'booking-rawatinap-list-page',
 	templateUrl: './booking-rawatinap-list.component.html',
	 providers: [RawatinapService,
				PemakaianKamarService,
				TempattidurService,
				ToastyService]
})

export class BookingRawatinapListComponent implements OnInit {
	allRawatinap: Rawatinap[];
	allJenis = ['', 'Rawat Inap', 'ICU'];
	allKelas = ['', 'VIP', '1', '2', '3'];
	allAvailableKamarBooked: any[];
	allAvailableKamarNow: any[];
	allAvailableKamarBookedByNamaKamar: any[];
	allAvailableKamarNowByNamaKamar: any[];
	allAvailableKamar: any[];
	selectedDate : string;
	allPemakaianKamarBooked : PemakaianKamar[];

	allTempatTidur: Tempattidur[];

	pemakaianKamarModal: PemakaianKamar = null;

	isTanggalSelected : boolean;
	
	public config;

	
	constructor(
		private rawatinapService: RawatinapService,
		private pemakaianKamarService: PemakaianKamarService,
		private tempattidurService: TempattidurService,
		private toastyService: ToastyService
	) {}

	ngOnInit() {
		
	}

	setTanggal() {
		this.rawatinapService.getAvailableKamarBooked(this.selectedDate).subscribe(
			data => {
				this.isTanggalSelected = false; 
				this.allAvailableKamarBooked = data;
				this.rawatinapService.getAvailableKamarNow(this.selectedDate).subscribe(
					data => { 
						this.allAvailableKamarNow = data;
						for (var index = 0; index < this.allAvailableKamarNow.length; index++) {
							this.allAvailableKamarNow[index].sisa = this.allAvailableKamarNow[index].kapasitas_kamar - this.allAvailableKamarNow[index].occupied_kamar - this.allAvailableKamarBooked[index].occupied_kamar;
						}
					}
				);
			}
		);

		this.rawatinapService.getAvailableKamarBookedByNamaKamar(this.selectedDate).subscribe(
			data => { 
				this.isTanggalSelected = false; 
				this.allAvailableKamarBookedByNamaKamar = data;
				this.rawatinapService.getAvailableKamarNowByNamaKamar(this.selectedDate).subscribe(
				data => { 
					this.allAvailableKamarNowByNamaKamar = data;
					for (var index = 0; index < this.allAvailableKamarNowByNamaKamar.length; index++) {
						var element = this.allAvailableKamarNowByNamaKamar;
						this.allAvailableKamar = element;
						this.allAvailableKamar[index].occupied_kamar = parseInt(element[index].occupied_kamar) + parseInt(this.allAvailableKamarBookedByNamaKamar[index].occupied_kamar);
					}
					this.allAvailableKamar = this.allAvailableKamar.filter(availablekamar => parseInt(availablekamar.kapasitas_kamar) - parseInt(availablekamar.occupied_kamar) > 0);
					this.isTanggalSelected = true;
				}
			);
			}
		);

		
	}

	newPemakaianKamar(rawatinap: any) {
		this.tempattidurService.getAllTempattidur(rawatinap.no_kamar)
			.subscribe(data => {
				this.allTempatTidur = data;
				this.pemakaianKamarService.getAllPemakaianKamarBookedWithTanggal(this.selectedDate, rawatinap.no_kamar)
				.subscribe(data => { 
						this.allPemakaianKamarBooked = data;

						this.allTempatTidur.forEach(element => {
							element.status = 1;
						})

						if(this.allPemakaianKamarBooked.length != 0) {
							this.allPemakaianKamarBooked.forEach(element => {
								this.allTempatTidur[element.no_tempat_tidur-1].status = 0;
							});
						}
						this.allTempatTidur = this.allTempatTidur.filter(tempattidur => tempattidur.status != 0);
					}
				);
			}
		);

    	this.pemakaianKamarModal = new PemakaianKamar();
		this.pemakaianKamarModal.no_kamar = rawatinap.no_kamar;
		this.pemakaianKamarModal.harga = rawatinap.harga_per_hari;
	 }
	
	private validateInput(): boolean {
		if	(this.pemakaianKamarModal.nama_booking == null) {
			this.handleError("Nama wajib diisi");
			return false;
		} else if (this.pemakaianKamarModal.kontak_booking == null) {
			this.handleError("Kontak wajib diisi");
			return false;
		} else if (this.pemakaianKamarModal.no_tempat_tidur == null) {
			this.handleError("No. tempat tidur wajib diisi");
			return false;
		}
		else {
			return true;
		}
	}

	private handleError(error: any) {
		let toastOptions: ToastOptions = {
	        title: "Error",
	        msg: error,
	        showClose: true,
	        timeout: 5000,
	        theme: 'material'
	    };
    	this.toastyService.error(toastOptions);
	}

    createPemakaianKamar(noKamar: string, noTempatTidur: number) {
		if(this.validateInput()) {
			this.pemakaianKamarService.createBookedKamar(this.selectedDate, this.pemakaianKamarModal).subscribe(
				data => { 
					this.setTanggal();
					let toastOptions:ToastOptions = {
						title: "Success",
						msg: "Reservasi kamar " + noKamar + " berhasil",
						showClose: true,
						timeout: 5000,
						theme: 'material'
					};

					this.toastyService.success(toastOptions);
				}
			);
		}
	}
}