import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
    Menu
} from 'lucide-react-native';
import Sidebar from "../../components/Sidebar";

export const ManageStall = ({ navigation }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showRowsDropdown, setShowRowsDropdown] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const tableHeaders = [
        { label: 'Action', sortable: false },
        { label: 'Event Code', sortable: true },
        { label: 'Event Name', sortable: true },
        { label: 'No. of Stalls', sortable: false },
        { label: 'Allocated', sortable: false },
        { label: 'Requested', sortable: false },
        { label: 'Payment Pending', sortable: false },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <Sidebar 
                isVisible={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                activeRoute="Manage_Stall"
                navigation={navigation}
            />
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                    <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={{ marginRight: 12 }}>
                        <Menu size={24} color="#344767" />
                    </TouchableOpacity>
                    <Text style={styles.pageTitle}>Manage Stall</Text>
                </View>

                <View style={styles.card}>
                    {/* Search Header */}
                    <View style={styles.searchHeader}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search Keyword"
                            placeholderTextColor="#cbd5e1"
                            value={searchTerm}
                            onChangeText={(text) => setSearchTerm(text)}
                        />
                    </View>

                    {/* Table (Horizontal Scrollable for Mobile Screen) */}
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={true} style={styles.tableScroll} keyboardShouldPersistTaps="handled">
                        <View style={styles.table}>
                            {/* Table Header */}
                            <View style={styles.tableHeaderRow}>
                                {tableHeaders.map((header, index) => (
                                    <View key={index} style={styles.tableHeaderCell}>
                                        <Text style={styles.tableHeaderLabel}>{header.label}</Text>
                                        {header.sortable && <ArrowUpDown size={12} color="#fff" style={styles.sortIcon} />}
                                    </View>
                                ))}
                            </View>

                            {/* Table Body */}
                            <View style={styles.tableRow}>
                                <Text style={styles.noDataText}>No Data Found.</Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Pagination */}
                    <View style={styles.paginationRow}>
                        <Text style={styles.paginationText}>Showing 0 to 0 of 0 entries</Text>

                        <View style={styles.controlsContainer}>
                            <View style={styles.buttonGroup}>
                                <TouchableOpacity style={styles.iconBtn} disabled>
                                    <ChevronsLeft size={16} color="#cbd5e1" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.iconBtn} disabled>
                                    <ChevronLeft size={16} color="#cbd5e1" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.iconBtn} disabled>
                                    <ChevronRight size={16} color="#cbd5e1" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.iconBtn} disabled>
                                    <ChevronsRight size={16} color="#cbd5e1" />
                                </TouchableOpacity>
                            </View>

                            {/* Custom Select Dropdown for Rows Per Page */}
                            <View style={styles.selectWrapper}>
                                <TouchableOpacity 
                                    style={styles.selectTrigger} 
                                    onPress={() => setShowRowsDropdown(!showRowsDropdown)}
                                >
                                    <Text style={styles.selectValue}>{rowsPerPage}</Text>
                                    <ChevronRight size={14} color="#64748b" style={styles.dropdownChevron} />
                                </TouchableOpacity>

                                {showRowsDropdown && (
                                    <View style={styles.dropdownList}>
                                        {[10, 25, 50].map((option) => (
                                            <TouchableOpacity 
                                                key={option}
                                                style={styles.dropdownOption}
                                                onPress={() => {
                                                    setRowsPerPage(option);
                                                    setShowRowsDropdown(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownOptionText}>{option}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    scrollContent: {
        padding: 24,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#344767',
        letterSpacing: -0.5,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
    },
    searchHeader: {
        padding: 20,
    },
    searchInput: {
        maxWidth: 210,
        height: 38,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 6,
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#334155',
    },
    tableScroll: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        overflow: 'hidden',
    },
    table: {
        minWidth: 800,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#0284c7', // sky-600
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    tableHeaderCell: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tableHeaderLabel: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sortIcon: {
        marginLeft: 4,
        opacity: 0.4,
    },
    tableRow: {
        paddingVertical: 32,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    noDataText: {
        color: '#64748b',
        fontSize: 14,
    },
    paginationRow: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 16,
    },
    paginationText: {
        fontSize: 14,
        color: '#94a3b8',
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    buttonGroup: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        padding: 2,
    },
    iconBtn: {
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    selectWrapper: {
        position: 'relative',
        zIndex: 1000,
    },
    selectTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        minWidth: 60,
        justifyContent: 'space-between',
    },
    selectValue: {
        fontSize: 14,
        color: '#64748b',
    },
    dropdownChevron: {
        transform: [{ rotate: '90deg' }],
        marginLeft: 4,
    },
    dropdownList: {
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 6,
        marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    dropdownOption: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    dropdownOptionText: {
        fontSize: 14,
        color: '#64748b',
    },
});

export default ManageStall;
