export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogConfig {
    apiUrl: string;
    token?: string;
}

// Global configuration
let config: LogConfig = {
    // We default to the evaluation log endpoint, though the exact path wasn't specified in the prompt
    // Assuming /evaluation-service/log as a placeholder
    apiUrl: 'http://4.224.186.213/evaluation-service/log'
};

/**
 * Configure the logging middleware (e.g., set auth token)
 */
export const configureLogging = (newConfig: Partial<LogConfig>) => {
    config = { ...config, ...newConfig };
};

/**
 * Reusable logging function
 * @param stack The stack trace or context identifier
 * @param level Log severity level
 * @param pkg The package or module name originating the log
 * @param message Descriptive log message
 */
export const Log = async (stack: string, level: LogLevel, pkg: string, message: string): Promise<void> => {
    const payload = {
        stack,
        level,
        package: pkg,
        message,
        timestamp: new Date().toISOString()
    };

    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        
        if (config.token) {
            headers['Authorization'] = `Bearer ${config.token}`;
        }

        // Make API call to test server if fetch is available
        if (typeof fetch !== 'undefined') {
            fetch(config.apiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            }).catch(() => {
                // Silently ignore network failures in production so app doesn't crash
            });
        }

        // Local console logging for observability
        const consoleMsg = `[${level.toUpperCase()}] [${pkg}] ${message}`;
        if (level === 'error') {
            console.error(consoleMsg);
            if (stack) console.error(`Stack: ${stack}`);
        }
        else if (level === 'warn') {
            console.warn(consoleMsg);
        }
        else if (level === 'info') {
            console.info(consoleMsg);
        }
        else {
            console.debug(consoleMsg);
        }

    } catch (error) {
        console.error('Logging middleware encountered an error:', error);
    }
};
