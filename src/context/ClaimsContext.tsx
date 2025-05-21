import React, { createContext, useContext, useState, useEffect } from 'react';
import { Claim, ClaimStatus, ClaimCategory, Department, ProductCategory } from '../types/claim';
import { getClaims, createClaim, updateClaim, getClaimById } from '../services/claimService';

interface ClaimsContextType {
  claims: Claim[];
  loading: boolean;
  error: string | null;
  addClaim: (claim: Omit<Claim, 'id'>) => Promise<Claim>;
  updateClaim: (id: string, updatedClaim: Partial<Claim>) => Promise<Claim>;
  getClaim: (id: string) => Promise<Claim | undefined>;
  refreshClaims: () => Promise<void>;
  calculateTotals: () => { 
    totalSolution: number;
    totalClaimed: number;
    totalSaved: number;
  };
}

const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

export const ClaimsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const data = await getClaims();
      setClaims(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError('Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const addClaim = async (claim: Omit<Claim, 'id'>) => {
    try {
      const newClaim = await createClaim(claim);
      setClaims(prevClaims => [...prevClaims, newClaim]);
      return newClaim;
    } catch (err) {
      console.error('Error adding claim:', err);
      setError('Failed to add claim');
      throw err;
    }
  };

  const updateClaimState = async (id: string, updatedClaim: Partial<Claim>) => {
    try {
      const updated = await updateClaim(id, updatedClaim);
      setClaims(prevClaims => 
        prevClaims.map(claim => 
          claim.id === id ? { ...claim, ...updated } : claim
        )
      );
      return updated;
    } catch (err) {
      console.error('Error updating claim:', err);
      setError('Failed to update claim');
      throw err;
    }
  };

  const getClaimData = async (id: string) => {
    try {
      return await getClaimById(id);
    } catch (err) {
      console.error('Error fetching claim:', err);
      setError('Failed to fetch claim');
      throw err;
    }
  };

  const calculateTotals = () => {
    const totalSolution = claims.reduce((sum, claim) => sum + claim.solution_amount, 0);
    const totalClaimed = claims.reduce((sum, claim) => sum + claim.claimed_amount, 0);
    const totalSaved = totalClaimed - totalSolution;

    return { totalSolution, totalClaimed, totalSaved };
  };

  return (
    <ClaimsContext.Provider value={{ 
      claims, 
      loading,
      error,
      addClaim, 
      updateClaim: updateClaimState, 
      getClaim: getClaimData,
      refreshClaims: fetchClaims,
      calculateTotals
    }}>
      {children}
    </ClaimsContext.Provider>
  );
};

export const useClaims = () => {
  const context = useContext(ClaimsContext);
  if (context === undefined) {
    throw new Error('useClaims must be used within a ClaimsProvider');
  }
  return context;
};