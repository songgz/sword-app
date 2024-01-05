import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {NgChartsModule} from "ng2-charts";
import {RestApiService} from "../services/rest-api.service";
import {AppCtxService} from "../services/app-ctx.service";
import {ChartConfiguration, ChartOptions} from "chart.js";

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgChartsModule]
})
export class StatisticsPage implements OnInit {

  constructor(private rest: RestApiService, private ctx: AppCtxService) { }

  ngOnInit() {

  }

  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    // 其他选项...
  };

  public barChartOptions: ChartConfiguration['options'] = {
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      x: {},
      y: {
        min: 10,
      },
    },

  };
  // public barChartOptions: ChartOptions = {
  //   responsive: true,
  //   // 其他选项设置
  // };
  // public barChartOptions: ChartConfiguration['options'] = {
  //   // We use these empty structures as placeholders for dynamic theming.
  //   scales: {
  //     x: {},
  //     y: {
  //       // min: 10,
  //     },
  //   },
  //   // plugins: {
  //   //   legend: {
  //   //     display: true,
  //   //   },
  //   //   // datalabels: {
  //   //   //   anchor: 'end',
  //   //   //   align: 'end',
  //   //   // },
  //   // },
  // };
  //public barChartType: ChartType = 'bar';
  //public barChartPlugins = [DataLabelsPlugin];

  public barChartData: any = {
    labels: [],
    datasets: [
      { data: [], label: '学习时间' },
      { data: [], label: '学习单词数量' },
    ],
  };

  ionViewDidEnter() {
    this.loadWeek();
  }

  loadWeek() {
    this.rest.get("statistics/week", {student_id: this.ctx.getUserId()}).subscribe(res => {
      this.barChartData = {
        labels: res.data.days,
        datasets: [
          {data: res.data.durations, label: '学习时间'},
          {data: res.data.completions, label: '学习单词数量'},
          {data: res.data.reviews, label: '复习单词数量'},
        ]
      };
      //this.cdr.detectChanges(); // 手动触发变更检测
      //console.log(this.barChartData);
    });
  }

  loadMonth() {
    this.rest.get("statistics/month", {student_id: this.ctx.getUserId()}).subscribe(res => {
      this.barChartData = {
        labels: res.data.days,
        datasets: [
          {data: res.data.durations, label: '学习时间'},
          {data: res.data.completions, label: '学习单词数量'},
          {data: res.data.reviews, label: '复习单词数量'},
        ]
      };
      //console.log(this.barChartData);
    });
  }

  loadYear() {
    this.rest.get("statistics/year", {student_id: this.ctx.getUserId()}).subscribe(res => {
      this.barChartData = {
        labels: res.data.days,
        datasets: [
          {data: res.data.durations, label: '学习时间'},
          {data: res.data.completions, label: '学习单词数量'},
          {data: res.data.reviews, label: '复习单词数量'},
        ]
      };
      console.log(this.barChartData);
    });
  }

  segmentChanged(event: CustomEvent) {
    const selectedValue = event.detail.value;
    switch (selectedValue) {
      case "week":
        this.loadWeek();
        break;
      case "month":
        this.loadMonth();
        break;
      case "year":
        this.loadYear();
        break;

    }

  }
}
