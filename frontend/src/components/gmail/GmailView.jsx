import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Inbox,
    Send,
    FileEdit,
    Search,
    RefreshCw,
    Plus,
    Mail,
    AlertCircle,
    ExternalLink,
    Loader2,
    ChevronLeft,
    Sparkles,
    Plane,
} from 'lucide-react';

import {
    getConnectionStatus,
    getConnectUrl,
    getGmailInbox,
    getGmailCRMSent,
    getGmailDrafts,
    searchGmail,
} from '../../services/emailService';

import { useEmailCache } from '../../context/EmailCacheContext';

import EmailList from './EmailList';
import EmailDetail from './EmailDetail';
import ComposeEmail from './ComposeEmail';
import { AIOutreach, AutoPilot } from '../ai/outreach/AiOutreach';

const TABS = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'crm-sent', label: 'Sent', icon: Send },
    { id: 'drafts', label: 'Drafts', icon: FileEdit },
    { id: 'ai-outreach', label: 'AI Outreach', icon: Sparkles },
    { id: 'autopilot', label: 'Auto Pilot', icon: Plane },
];

const GmailView = () => {
    const {
        getCachedData,
        setCachedData,
        invalidateCache,
        getCachedConnectionStatus,
        setCachedConnectionStatus,
    } = useEmailCache();

    const [activeTab, setActiveTab] = useState('inbox');
    const [emails, setEmails] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [nextPageToken, setNextPageToken] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Connection
    const [emailConnected, setEmailConnected] = useState(null);
    const [checkingConnection, setCheckingConnection] = useState(true);

    // Selection
    const [selectedEmail, setSelectedEmail] = useState(null);

    // Compose
    const [showCompose, setShowCompose] = useState(false);
    const [editingDraft, setEditingDraft] = useState(null);

    const initialFetchDone = useRef(false);

    // Check Gmail connection
    useEffect(() => {
        const cachedStatus = getCachedConnectionStatus();
        if (cachedStatus !== null) {
            setEmailConnected(cachedStatus);
            setCheckingConnection(false);
        } else {
            checkConnection();
        }
    }, []);

    // Fetch data on tab change (skip outreach tabs)
    useEffect(() => {
        if (
            emailConnected &&
            activeTab !== 'ai-outreach' &&
            activeTab !== 'autopilot'
        ) {
            const cachedData = getCachedData(activeTab);
            if (cachedData && !initialFetchDone.current) {
                if (activeTab === 'drafts') {
                    setDrafts(cachedData.items);
                } else {
                    setEmails(cachedData.items);
                }
                setNextPageToken(cachedData.nextPageToken);
                setLoading(false);
                initialFetchDone.current = true;
            } else if (!cachedData) {
                fetchData();
            }
        }
    }, [activeTab, emailConnected]);

    const checkConnection = async () => {
        try {
            setCheckingConnection(true);
            const status = await getConnectionStatus();
            setEmailConnected(status.connected);
            setCachedConnectionStatus(status.connected);
        } catch {
            setEmailConnected(false);
            setCachedConnectionStatus(false);
        } finally {
            setCheckingConnection(false);
        }
    };

    const handleConnectEmail = async () => {
        try {
            const { authUrl } = await getConnectUrl();
            window.location.href = authUrl;
        } catch {
            setError('Failed to initiate Gmail connection');
        }
    };

    const fetchData = useCallback(
        async (pageToken = null, forceRefresh = false) => {
            if (!pageToken && !forceRefresh) {
                const cachedData = getCachedData(activeTab);
                if (cachedData) {
                    activeTab === 'drafts'
                        ? setDrafts(cachedData.items)
                        : setEmails(cachedData.items);
                    setNextPageToken(cachedData.nextPageToken);
                    setLoading(false);
                    return;
                }
            }

            try {
                if (!pageToken) setLoading(true);
                setError(null);

                let result;

                if (activeTab === 'inbox') {
                    result = await getGmailInbox({ pageToken });
                    const data = pageToken
                        ? [...emails, ...result.messages]
                        : result.messages;
                    setEmails(data);
                    if (!pageToken)
                        setCachedData('inbox', {
                            items: data,
                            nextPageToken: result.nextPageToken,
                        });
                }

                if (activeTab === 'crm-sent') {
                    result = await getGmailCRMSent({ pageToken });
                    const data = pageToken
                        ? [...emails, ...result.messages]
                        : result.messages;
                    setEmails(data);
                    if (!pageToken)
                        setCachedData('crm-sent', {
                            items: data,
                            nextPageToken: result.nextPageToken,
                        });
                }

                if (activeTab === 'drafts') {
                    result = await getGmailDrafts({ pageToken });
                    const data = pageToken
                        ? [...drafts, ...result.drafts]
                        : result.drafts;
                    setDrafts(data);
                    if (!pageToken)
                        setCachedData('drafts', {
                            items: data,
                            nextPageToken: result.nextPageToken,
                        });
                }

                setNextPageToken(result?.nextPageToken);
            } catch (err) {
                if (err.response?.data?.code === 'EMAIL_NOT_CONNECTED') {
                    setEmailConnected(false);
                    setCachedConnectionStatus(false);
                } else {
                    setError('Failed to load emails. Please try again.');
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [activeTab, emails, drafts]
    );

    const handleRefresh = () => {
        setRefreshing(true);
        setSelectedEmail(null);
        invalidateCache(activeTab);
        fetchData(null, true);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            fetchData();
            return;
        }
        try {
            setIsSearching(true);
            setLoading(true);
            const result = await searchGmail(searchQuery);
            setEmails(result.messages);
            setNextPageToken(result.nextPageToken);
        } catch {
            setError('Search failed. Please try again.');
        } finally {
            setIsSearching(false);
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (nextPageToken) fetchData(nextPageToken);
    };

    if (checkingConnection) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                <span className="ml-3 text-gray-600">
                    Checking Gmail connection...
                </span>
            </div>
        );
    }

    if (!emailConnected) {
        return (
            <div className="bg-white rounded-xl border p-8 text-center">
                <Mail className="w-12 h-12 mx-auto text-sky-600 mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                    Connect Your Gmail
                </h2>
                <button
                    onClick={handleConnectEmail}
                    className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg"
                >
                    Connect Gmail <ExternalLink className="inline w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border overflow-hidden">
            {/* Header */}
            <div className="border-b p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Gmail</h2>
                    <button
                        onClick={() => setShowCompose(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        <Plus size={16} /> Compose
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-3">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => {
                                setActiveTab(id);
                                setSelectedEmail(null);
                                setSearchQuery('');
                            }}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${
                                activeTab === id
                                    ? 'bg-sky-100 text-sky-700'
                                    : 'hover:bg-gray-100'
                            }`}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                {!['drafts', 'ai-outreach', 'autopilot'].includes(
                    activeTab
                ) && (
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQuery(e.target.value)
                            }
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                            placeholder="Search emails..."
                        />
                    </form>
                )}
            </div>

            {/* Content */}
            {activeTab === 'ai-outreach' ? (
                <AIOutreach />
            ) : activeTab === 'autopilot' ? (
                <AutoPilot />
            ) : (
                <EmailList
                    emails={activeTab === 'drafts' ? drafts : emails}
                    loading={loading}
                    onLoadMore={handleLoadMore}
                    hasMore={!!nextPageToken}
                />
            )}

            {showCompose && (
                <ComposeEmail
                    isOpen
                    draft={editingDraft}
                    onClose={() => setShowCompose(false)}
                />
            )}
        </div>
    );
};

export default GmailView;