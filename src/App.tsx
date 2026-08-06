/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {Analytics} from '@vercel/analytics/react';
import ChessTutorial from './components/ChessTutorial';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-100 font-sans">
      <ChessTutorial />
      <Analytics />
    </div>
  );
}
