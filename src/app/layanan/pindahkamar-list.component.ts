import { Component, OnInit }		from '@angular/core';
import { Location }					from '@angular/common';
import { ActivatedRoute, Params }	from '@angular/router';
import { Observable } 	from 'rxjs/Observable';

import { Transaksi }						from '../transaksi/transaksi';
import { TransaksiService }			from '../transaksi/transaksi.service';
import { Rawatinap }			from './rawatinap';
import { RawatinapService }		from './rawatinap.service';
import { Tempattidur }          from './tempattidur';
import { TempattidurService }		from './tempattidur.service';
import { PemakaianKamar }          from './pemakaian-kamar';
import { PemakaianKamarService }   from './pemakaian-kamar.service';
import { TenagaMedis }		from '../tenaga-medis/tenaga-medis';
import { TenagaMedisService }		from '../tenaga-medis/tenaga-medis.service';
import { Dokter }		from '../tenaga-medis/dokter';
import { Pasien } from '../pasien/pasien';
import { PasienService } from '../pasien/pasien.service';

@Component({
 	selector: 'pindahkamar-list-page',
 	templateUrl: './pindahkamar-list.component.html',
 	providers: [RawatinapService,
         TempattidurService,
		 PemakaianKamarService,
         TransaksiService,
		 TenagaMedisService,
		 PasienService]
})

export class PindahKamarListComponent implements OnInit {
	allRawatinap: Rawatinap[];
	allJenis = ['', 'Rawat Inap', 'ICU'];
	allKelas = ['', 'VIP', '1', '2', '3'];
	
	public allPasien: Pasien[];
	public pasien: Pasien;

	public transaksi: Transaksi;

	allTempatTidur: Tempattidur[];
	allDokter: Dokter[];
	allPemakaianKamarBooked : PemakaianKamar[];

	pemakaianKamarModal: PemakaianKamar = null;
	tempatTidurModal : Tempattidur = null;
    pemakaianKamarModalNama: string = null;

	rawatinap: Rawatinap;
	pemakaianKamar : PemakaianKamar;

	constructor(
		private rawatinapService: RawatinapService,
		private transaksiService: TransaksiService,
		private tempattidurService: TempattidurService,
		private pemakaianKamarService: PemakaianKamarService,
		private tenagaMedisService: TenagaMedisService,
		private pasienService: PasienService,
		private route: ActivatedRoute,
		private location: Location
	) {}

	ngOnInit() {
		this.rawatinapService.getAllAvailableRawatinap().subscribe(
     		data => { this.allRawatinap = data }
		);
		
		this.route.params
			.switchMap((params: Params) => this.pemakaianKamarService.getPemakaianKamar(params['idPemakaian']))
			.subscribe( data =>  this.pemakaianKamar = data);
	}

	newPemakaianKamar(rawatinap: Rawatinap) {
		this.tempattidurService.getAllAvailableTempatTidur(rawatinap.no_kamar)
			.subscribe(data => {
				this.allTempatTidur = data;
			}
		);
		
		
		this.pemakaianKamarModal = new PemakaianKamar();
		this.pemakaianKamarModal.id_transaksi = this.pemakaianKamar.id_transaksi;
		this.pemakaianKamarModal.no_pegawai = this.pemakaianKamar.no_pegawai;
		this.pemakaianKamarModal.no_kamar = rawatinap.no_kamar;
		this.pemakaianKamarModal.harga = rawatinap.harga_per_hari;

		this.tempatTidurModal = new Tempattidur();
		this.tempatTidurModal.no_kamar = rawatinap.no_kamar;
		this.tempatTidurModal.status = 0;		
 	}

	setTempatTidur() {
		this.tempatTidurModal.no_tempat_tidur = this.pemakaianKamarModal.no_tempat_tidur;
	}

    pindahPemakaianKamar(noKamar: string, noTempatTidur: number) {
    	this.pemakaianKamarService.pindahPemakaianKamar(this.pemakaianKamar.id, this.pemakaianKamarModal).subscribe(
      		data => {
				this.tempattidurService.updateTempatTidur(this.tempatTidurModal, noKamar, noTempatTidur).subscribe(
					data => { this.ngOnInit() }
				);
			}
    	);
  	}
}