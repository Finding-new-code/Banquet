import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

/**
 * Database Service
 * Provides MongoDB connection management and utilities
 */
@Injectable()
export class DatabaseService implements OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name);

    constructor(@InjectConnection() private connection: Connection) {
        this.connection.on('connected', () => {
            this.logger.log('✅ MongoDB connection established');
        });

        this.connection.on('error', (err) => {
            this.logger.error('❌ MongoDB connection error', err);
        });

        this.connection.on('disconnected', () => {
            this.logger.warn('MongoDB disconnected');
        });
    }

    async onModuleDestroy() {
        await this.connection.close();
        this.logger.log('MongoDB connection closed');
    }

    /**
     * Get the current MongoDB connection
     */
    getConnection(): Connection {
        return this.connection;
    }

    /**
     * Check if database connection is ready
     */
    isConnected(): boolean {
        return this.connection.readyState === 1;
    }

    /**
     * Ping the database to check connectivity
     */
    async ping(): Promise<boolean> {
        try {
            if (!this.connection.db) {
                this.logger.warn('Database not yet connected');
                return false;
            }
            await this.connection.db.admin().ping();
            return true;
        } catch (error) {
            this.logger.error('Database ping failed', error);
            return false;
        }
    }
}
