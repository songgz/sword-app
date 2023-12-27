import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {ChartConfiguration, ChartData, ChartType} from 'chart.js/auto';
import {BaseChartDirective, NgChartsModule} from "ng2-charts";

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgChartsModule]
})
export class StatisticsPage implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  constructor() { }

  ngOnInit() {
  }

  public barChartOptions: ChartConfiguration['options'] = {
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      x: {},
      y: {
        min: 10,
      },
    },
    // plugins: {
    //   legend: {
    //     display: true,
    //   },
    //   // datalabels: {
    //   //   anchor: 'end',
    //   //   align: 'end',
    //   // },
    // },
  };
  public barChartType: ChartType = 'bar';
  //public barChartPlugins = [DataLabelsPlugin];

  public barChartData: ChartData<'bar'> = {
    labels: ['12月25日', '12月26日', '12月27日', '12月28日', '12月27日', '12月28日'],
    datasets: [
      { data: [65, 59, 80, 81, 56, 55, 40], label: '学习时间' },
      { data: [28, 48, 40, 19, 86, 27, 90], label: '学习单词数量' },
    ],
  };

  ionViewDidEnter() {

  }


}
