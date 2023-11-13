// src/controllers/disk-space.controller.ts

import { Controller, Get } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Controller('disk-space')
export class DiskSpaceController {

  @Get()
  async getDiskSpace() {
    try {
        const { stdout, stderr } = await execAsync('wmic logicaldisk get size,freespace,caption');
    
        if (stderr) {
          throw new Error(stderr);
        }
    
        const lines = stdout.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
        // Assuming the first line contains column headers
        const headers = lines[0].split(/\s+/);
        
    
        // Process each subsequent line and create an array of objects
        const diskInfo = lines.slice(1).map(line => {
          const values = line.split(/\s+/);
          const disk = {};
    
          headers.forEach((header, index) => {
            // Convert size and free space values to GB
            const valueInBytes = parseInt(values[index], 10);
            disk[header.toLowerCase()] = header.toLowerCase().includes('size')
              ? (valueInBytes/ (1024 ** 3))
              : valueInBytes;
          });
    
          return disk;
        });
    
        return {
          status: 'success',
          data: diskInfo,
        };
      } catch (error) {
        return {
          status: 'error',
          message: error.message,
        };
      }
      
    
  }
  
}
