import { Component, AfterViewInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { SnackbarService } from '../services/snackbar.service';
import { GlobalConstants } from '../shared/global-constants';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {

	responseMassage: any;
	data:any;

	ngAfterViewInit() { }

	constructor(private dashboardService:DashboardService,
		private snackbarService:SnackbarService) {
			this.dashboardData();
	}

	dashboardData(){
		this.dashboardService.getDetails().subscribe((response:any)=>{
			this.data = response;
		},(error:any)=>{
			console.log(error);
			if(error.error?.message){
				this.responseMassage = error.error?.message;
			}
			else{
				this.responseMassage = GlobalConstants.genericError;
			}
			this.snackbarService.openSnackBar(this.responseMassage, GlobalConstants.error);
		})
	}
}
