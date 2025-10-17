# Design Document

## Overview

The starred compounds feature adds favoriting capability to the chemical compound application through a star button on compound cards and a dedicated starred compounds view. The design leverages Angular's reactive patterns with RxJS for state management and uses browser localStorage for persistence. The architecture is designed to be easily extensible for future user authentication integration.

## Architecture

### Component Architecture
```
CompoundGalleryComponent (Enhanced)
├── Tab Navigation (All | Starred)
├── CompoundCardComponent (Enhanced)
│   └── StarButtonComponent (New)
└── EmptyStateComponent (New - for no starred compounds)

CompoundDetailsComponent (Enhanced)
└── StarButtonComponent (Shared)
```

### Service Architecture
```
StarredCompoundsService (New)
├── Local Storage Management
├── Starred State Management
├── Event Broadcasting
└── Future: User Authentication Integration

CompoundService (Enhanced)
└── Integration with StarredCompoundsService
```

## Components and Interfaces

### StarredCompoundsService

**Purpose:** Manages starred compound state, persistence, and notifications

**Key Methods:**
- `isStarred(compoundId: string): Observable<boolean>` - Check if compound is starred
- `toggleStar(compound: Compound): Observable<boolean>` - Toggle starred status
- `getStarredCompounds(): Observable<Compound[]>` - Get all starred compounds
- `getStarredCount(): Observable<number>` - Get count of starred compounds
- `clearAllStarred(): void` - Clear all starred compounds

**State Management:**
- Uses BehaviorSubject for reactive starred compounds list
- Emits changes to all subscribers immediately
- Handles localStorage serialization/deserialization

### StarButtonComponent

**Purpose:** Reusable star toggle button with visual feedback

**Inputs:**
- `compound: Compound` - The compound to star/unstar
- `size: 'small' | 'medium' | 'large'` - Button size variant

**Features:**
- Animated star fill/unfill transitions
- Loading state during operations
- Accessibility support (ARIA labels, keyboard navigation)
- Material Design star icons

### Enhanced CompoundGalleryComponent

**New Features:**
- Tab navigation between "All Compounds" and "Starred" views
- Starred count badge on starred tab
- Empty state handling for no starred compounds
- Maintains separate pagination state for each tab

**Tab State Management:**
- Uses Angular Router for tab state persistence
- Query parameters: `?tab=starred`
- Preserves search filters when switching tabs

### Enhanced CompoundCardComponent

**New Features:**
- Integrated StarButtonComponent in card header
- Hover effects for star button
- Consistent styling with existing card design

## Data Models

### StarredCompound Interface
```typescript
interface StarredCompound {
  id: string;
  compound: Compound;
  starredAt: Date;
}
```

### LocalStorage Schema
```typescript
interface StarredCompoundsStorage {
  version: string;
  compounds: {
    [compoundId: string]: {
      compound: Compound;
      starredAt: string; // ISO date string
    }
  };
}
```

## Error Handling

### Storage Errors
- Graceful degradation when localStorage is unavailable
- Fallback to sessionStorage or in-memory storage
- User notification for storage quota exceeded

### Service Errors
- Retry logic for failed star operations
- Error notifications through NotificationService
- Optimistic UI updates with rollback on failure

### Component Errors
- Loading states during async operations
- Disabled state for star button during operations
- Error boundaries for component failures

## Testing Strategy

### Unit Tests
- StarredCompoundsService: Storage operations, state management
- StarButtonComponent: User interactions, visual states
- Enhanced components: New functionality integration

### Integration Tests
- Tab navigation and state persistence
- Cross-component star state synchronization
- LocalStorage integration and fallback scenarios

### E2E Tests
- Complete star/unstar workflow
- Tab switching with starred compounds
- Empty state scenarios

## Performance Considerations

### Optimization Strategies
- Lazy loading of starred compounds data
- Debounced star toggle operations (prevent rapid clicking)
- Virtual scrolling for large starred compound lists
- Efficient change detection with OnPush strategy

### Memory Management
- Proper subscription cleanup in components
- Efficient localStorage serialization
- Pagination for starred compounds view

## Accessibility

### ARIA Support
- Star button: `aria-label`, `aria-pressed` states
- Tab navigation: `role="tablist"`, `aria-selected`
- Empty state: Proper heading hierarchy

### Keyboard Navigation
- Tab key navigation through star buttons
- Enter/Space key activation for star toggle
- Arrow key navigation between tabs

## Future Authentication Integration

### Design Considerations
- StarredCompoundsService abstraction ready for API integration
- User-specific starred compounds storage
- Sync between local and server state
- Migration path from localStorage to user accounts

### API Integration Points
```typescript
// Future API methods
interface StarredCompoundsAPI {
  getUserStarredCompounds(userId: string): Observable<Compound[]>;
  starCompound(userId: string, compoundId: string): Observable<void>;
  unstarCompound(userId: string, compoundId: string): Observable<void>;
}
```

## Visual Design

### Star Button States
- **Unstarred:** Outline star icon (star_border)
- **Starred:** Filled star icon (star) with yellow/gold color
- **Loading:** Spinning animation or pulse effect
- **Hover:** Subtle scale animation and color transition

### Tab Design
- Material Design tab component
- Badge showing starred count: "Starred (5)"
- Smooth transitions between tab content
- Consistent with existing application styling

### Empty State
- Centered message: "No starred compounds yet"
- Subtitle: "Star compounds to see them here"
- Optional illustration or icon
- Call-to-action to browse compounds