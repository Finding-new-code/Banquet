import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    MongooseHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

/**
 * Health Check Controller
 * Provides endpoints to monitor application and infrastructure health
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private mongooseHealth: MongooseHealthIndicator,
        private memoryHealth: MemoryHealthIndicator,
        private diskHealth: DiskHealthIndicator,
    ) { }

    /**
     * Overall health check
     * Returns status of all critical services
     */
    @Get()
    @HealthCheck()
    @ApiOperation({ summary: 'Check overall application health' })
    check() {
        return this.health.check([
            () => this.mongooseHealth.pingCheck('mongodb'),
            () =>
                this.memoryHealth.checkHeap('memory_heap', 300 * 1024 * 1024), // 300MB
            () =>
                this.diskHealth.checkStorage('disk', {
                    path: '/',
                    thresholdPercent: 0.9, // 90%
                }),
        ]);
    }

    /**
     * Database health check
     */
    @Get('db')
    @HealthCheck()
    @ApiOperation({ summary: 'Check database connectivity' })
    checkDatabase() {
        return this.health.check([
            () => this.mongooseHealth.pingCheck('mongodb'),
        ]);
    }

    /**
     * Memory health check
     */
    @Get('memory')
    @HealthCheck()
    @ApiOperation({ summary: 'Check memory usage' })
    checkMemory() {
        return this.health.check([
            () =>
                this.memoryHealth.checkHeap('memory_heap', 300 * 1024 * 1024),
            () =>
                this.memoryHealth.checkRSS('memory_rss', 300 * 1024 * 1024),
        ]);
    }

    /**
     * Disk health check
     */
    @Get('disk')
    @HealthCheck()
    @ApiOperation({ summary: 'Check disk space' })
    checkDisk() {
        return this.health.check([
            () =>
                this.diskHealth.checkStorage('disk', {
                    path: '/',
                    thresholdPercent: 0.9,
                }),
        ]);
    }
}
