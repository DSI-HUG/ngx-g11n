/* eslint-disable @typescript-eslint/naming-convention */
import { CurrencyPipe, DatePipe, DecimalPipe, I18nPluralPipe, PercentPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, type OnInit } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { currentLanguage, setLanguage } from '@hug/ngx-g11n';
import { format } from 'date-fns';

@Component({
    selector: 'app-demo',
    templateUrl: './demo.component.html',
    styleUrl: './demo.component.scss',
    imports: [
        DatePipe,
        CurrencyPipe,
        DecimalPipe,
        PercentPipe,
        I18nPluralPipe,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule
    ]
})
export class DemoComponent implements OnInit {
    public currentLanguage = currentLanguage();
    public backendResponse: unknown;

    public currentDate = new Date();
    public dateFnsFormatted = format(this.currentDate, 'PPPP');
    public price = 1234.56;
    public num = 1234.56789;
    public percentage = 0.8567;
    public messageMapping = {
        '=0': $localize`:@@pluralNoMessage:-`,
        '=1': $localize`:@@pluralOneMessage:-`,
        'other': $localize`:@@pluralMultipleMessages:-`
    };

    // ---

    private httpClient = inject(HttpClient);

    public ngOnInit(): void {
        // Make an API call to try out 'Accept-Language' header
        this.httpClient.get<Record<string, string>>('/api/g11n').subscribe(data => {
            this.backendResponse = data['g11n'];
        });
    }

    public switchLanguage(code: string): void {
        setLanguage(code);
    }
}
