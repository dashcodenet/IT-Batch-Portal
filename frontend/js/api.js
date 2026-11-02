/**
 * Api.js - Handles all communication with Google Apps Script
 */
const Api = {
    async fetchData(action, params = {}, forceRefresh = false) {
        const cacheKey = `${action}_${JSON.stringify(params)}`;

        // 1. Try Cache (إذا كانت مدة الكاش أكبر من 0)
        if (APP_CONFIG.CLIENT_CACHE_TTL_MINUTES > 0 && !forceRefresh) {
            const cachedData = CacheManager.get(cacheKey);
            if (cachedData) {
                console.log(`[API] Serving from cache: ${cacheKey}`);
                return cachedData;
            }
        }

        // 2. Build URL
        const url = new URL(APP_CONFIG.API_URL);
        url.searchParams.append('action', action);
        url.searchParams.append('t', Date.now()); // ⭐️ منع كاش المتصفح
        
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        // 3. Fetch from Network
        try {
            const response = await fetch(url.toString());
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            
            const json = await response.json();
            const isSuccess = json.success === true || json.status === 'ok';
            
            if (!isSuccess) {
                let errMsg = 'Unknown API error';
                if (typeof json.error === 'string') errMsg = json.error;
                else if (json.error && json.error.messageAr) errMsg = json.error.messageAr;
                throw new Error(errMsg);
            }

            const data = json.data;
            if (APP_CONFIG.CLIENT_CACHE_TTL_MINUTES > 0) {
                CacheManager.set(cacheKey, data);
            }
            return data;

        } catch (error) {
            return ErrorHandler.handleApiError(error);
        }
    },

    async getYears(forceRefresh = false) { return this.fetchData('listYears', {}, forceRefresh); },
    async getTerms(year, forceRefresh = false) { return this.fetchData('listTerms', { year }, forceRefresh); },
    async getSubjects(year, term, forceRefresh = false) { return this.fetchData('listSubjects', { year, term }, forceRefresh); },
    async getFiles(year, term, subject, forceRefresh = false) { return this.fetchData('listFiles', { year, term, subject }, forceRefresh); },
    async getNews(forceRefresh = false) { return this.fetchData('news', {}, forceRefresh); },
    async getAnnouncements(forceRefresh = false) { return this.fetchData('announcements', {}, forceRefresh); },
    
    // ⭐️ تم التصحيح: استخدام 'getImages' بدلاً من 'newsImages' ليتطابق مع Code.gs
    async getNewsImages(forceRefresh = false) { 
        return this.fetchData('getImages', {}, forceRefresh); 
    }
};