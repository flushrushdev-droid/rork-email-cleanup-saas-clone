import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { AIModal } from '@/components/mail/AIModal';
import { ComposeView } from '@/components/mail/ComposeView';
import { EmailDetailView } from '@/components/mail/EmailDetailView';
import { FoldersView } from '@/components/mail/FoldersView';
import { FolderDetailView } from '@/components/mail/FolderDetailView';
import { InboxView } from '@/components/mail/InboxView';
import { CreateFolderModal } from '@/components/mail/CreateFolderModal';
import { UndoToast } from '@/components/common/UndoToast';
import { useMailScreen } from '@/hooks/useMailScreen';
import { createMailStyles } from '@/styles/app/mail';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';

export default function MailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createMailStyles(colors), [colors]);
  const { showInfo } = useEnhancedToast();
  
  const {
    currentView,
    setCurrentView,
    selectedEmail,
    setSelectedEmail,
    selectedFolder,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    composeTo,
    setComposeTo,
    composeCc,
    setComposeCc,
    composeSubject,
    setComposeSubject,
    composeBody,
    setComposeBody,
    isModalVisible,
    setIsModalVisible,
    folderName,
    setFolderName,
    folderRule,
    setFolderRule,
    isCreating,
    customFolders,
    selectionMode,
    selectedEmails,
    toast,
    toastTimer,
    isAIModalVisible,
    setIsAIModalVisible,
    allEmails,
    filteredEmails,
    drafts,
    smartFolders,
    handleEmailPress,
    handleCompose,
    handleSend,
    handleSaveDraft,
    handleLoadDraft,
    handleDeleteDraft,
    handleArchive,
    handleDelete,
    handleStar,
    handleReply,
    handleReplyAll,
    handleForward,
    handleNextEmail,
    handlePrevEmail,
    handleCreateFolder,
    handleToggleSelection,
    handleSelectAll,
    handleCancelSelection,
    handleBulkDelete,
    handleBulkArchive,
    handleBulkMarkRead,
    handleBulkMove,
    handleRefresh,
    isDemoMode,
    isSyncing,
  } = useMailScreen();


  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {currentView === 'inbox' && (
        <InboxView
          insets={insets}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          filteredEmails={filteredEmails}
          drafts={drafts}
          smartFolders={smartFolders}
          customFolders={customFolders}
          onEmailPress={handleEmailPress}
          onStarEmail={handleStar}
          onLoadDraft={handleLoadDraft}
          onDeleteDraft={handleDeleteDraft}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onCreateFolder={() => setIsModalVisible(true)}
          onRefresh={handleRefresh}
          isRefreshing={isSyncing}
          isLoading={isSyncing && filteredEmails.length === 0 && !isDemoMode}
          selectionMode={selectionMode}
          selectedEmails={selectedEmails}
          onToggleSelection={handleToggleSelection}
          onSelectAll={handleSelectAll}
          onCancelSelection={handleCancelSelection}
          onBulkDelete={handleBulkDelete}
          onBulkArchive={handleBulkArchive}
          onBulkMarkRead={handleBulkMarkRead}
          onBulkMove={handleBulkMove}
          onCompose={handleCompose}
        />
      )}
      {currentView === 'folders' && (
        <FoldersView
          insets={insets}
          isDemoMode={isDemoMode}
          smartFolders={smartFolders}
          onCreateFolder={() => setIsModalVisible(true)}
        />
      )}
      {currentView === 'folder-detail' && (
        <FolderDetailView
          selectedFolder={selectedFolder}
          filteredEmails={filteredEmails}
          onBack={() => setCurrentView('folders')}
          onEmailPress={handleEmailPress}
          onStar={handleStar}
          insets={insets}
        />
      )}
      {currentView === 'detail' && selectedEmail && (() => {
        const currentIndex = filteredEmails.findIndex(e => e.id === selectedEmail.id);
        const hasNext = currentIndex !== -1 && currentIndex < filteredEmails.length - 1;
        const hasPrev = currentIndex > 0;
        
        return (
        <EmailDetailView
          selectedEmail={selectedEmail}
          insets={insets}
          onBack={() => setCurrentView('inbox')}
          onStar={handleStar}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onReply={handleReply}
          onReplyAll={handleReplyAll}
          onForward={handleForward}
            onNext={hasNext ? handleNextEmail : undefined}
            onPrev={hasPrev ? handlePrevEmail : undefined}
            hasNext={hasNext}
            hasPrev={hasPrev}
            currentIndex={currentIndex !== -1 ? currentIndex : undefined}
            totalCount={filteredEmails.length}
        />
        );
      })()}
      {currentView === 'compose' && (
        <ComposeView
          insets={insets}
          composeTo={composeTo}
          composeCc={composeCc}
          composeSubject={composeSubject}
          composeBody={composeBody}
          onChangeComposeTo={setComposeTo}
          onChangeComposeCc={setComposeCc}
          onChangeComposeSubject={setComposeSubject}
          onChangeComposeBody={setComposeBody}
          onClose={() => {
            setCurrentView('inbox');
            // Clear compose params from URL to prevent re-triggering
            router.setParams({ compose: undefined, emailId: params.emailId || undefined });
          }}
          onSend={handleSend}
          onSaveDraft={handleSaveDraft}
          onOpenAIModal={() => setIsAIModalVisible(true)}
        />
      )}

      <AIModal
        visible={isAIModalVisible}
        onClose={() => setIsAIModalVisible(false)}
        onGenerate={(format, tone, length, prompt) => {
          showInfo(`Generating ${format} email with ${tone} tone, ${length} length...`, { duration: 2000 });
        }}
        insets={insets}
      />

      <CreateFolderModal
        visible={isModalVisible}
        folderName={folderName}
        folderRule={folderRule}
        isCreating={isCreating}
        onClose={() => !isCreating && setIsModalVisible(false)}
        onFolderNameChange={setFolderName}
        onFolderRuleChange={setFolderRule}
        onCreate={handleCreateFolder}
      />

      {toast && (
        <UndoToast
          message={toast.message}
          onUndo={toast.onUndo}
          timer={toastTimer}
          maxTimer={5}
          colors={colors}
          insets={insets}
        />
      )}
    </View>
  );
}

