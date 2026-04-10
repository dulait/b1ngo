import { Pipe, PipeTransform } from '@angular/core';
import { formatDuration } from '../types';

@Pipe({
  name: 'bngFormatDuration',
  standalone: true,
})
export class BngFormatDurationPipe implements PipeTransform {
  transform(iso: string, prefix = ''): string {
    return formatDuration(iso, prefix);
  }
}
